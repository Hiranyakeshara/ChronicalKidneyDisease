"""
Prediction bridge for the CKDu water-risk Next.js app.

The Next.js API route sends one JSON object through stdin. This script loads the
pickle model package and returns a JSON prediction through stdout.
"""

from __future__ import annotations

import json
import os
import sys
import warnings
from typing import Any, Dict, Iterable, Set

warnings.filterwarnings("ignore")

import joblib
import numpy as np
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "ckdu_water_risk_model_package.pkl")

REQUIRED_FEATURES = [
    "ph",
    "Hardness",
    "Solids",
    "Chloramines",
    "Sulfate",
    "Conductivity",
    "Organic_carbon",
    "Trihalomethanes",
    "Turbidity",
]


def install_sklearn_compatibility_patch() -> None:
    """Allow the package to load even if sklearn is newer than the training version.

    The model was trained with scikit-learn 1.6.x. The recommended fix is to use
    the same dependency versions listed in requirements.txt. This patch exists as
    a defensive fallback for newer local environments.
    """
    try:
        import sklearn.compose._column_transformer as column_transformer

        if not hasattr(column_transformer, "_RemainderColsList"):
            class _RemainderColsList(list):  # type: ignore
                def __init__(self, *args: Any, **kwargs: Any) -> None:
                    data = args[0] if args and isinstance(args[0], (list, tuple)) else []
                    super().__init__(data)
                    self.future_dtype = kwargs.get("future_dtype", None)
                    self.warning_was_emitted = kwargs.get("warning_was_emitted", False)
                    self.warning_enabled = kwargs.get("warning_enabled", True)

                def __setstate__(self, state: Dict[str, Any]) -> None:
                    self.clear()
                    self.extend(state.get("data", []))
                    self.future_dtype = state.get("future_dtype", None)
                    self.warning_was_emitted = state.get("warning_was_emitted", False)
                    self.warning_enabled = state.get("warning_enabled", True)

                def __getstate__(self) -> Dict[str, Any]:
                    return {
                        "data": list(self),
                        "future_dtype": self.future_dtype,
                        "warning_was_emitted": self.warning_was_emitted,
                        "warning_enabled": self.warning_enabled,
                    }

            column_transformer._RemainderColsList = _RemainderColsList
    except Exception:
        pass


def patch_loaded_estimators(obj: Any, seen: Set[int] | None = None) -> None:
    """Patch attributes that changed between sklearn versions."""
    if seen is None:
        seen = set()

    object_id = id(obj)
    if object_id in seen:
        return
    seen.add(object_id)

    try:
        from sklearn.impute import SimpleImputer

        if isinstance(obj, SimpleImputer) and not hasattr(obj, "_fill_dtype"):
            obj._fill_dtype = getattr(getattr(obj, "statistics_", None), "dtype", np.dtype("float64"))
    except Exception:
        pass

    if isinstance(obj, dict):
        for value in obj.values():
            patch_loaded_estimators(value, seen)
    elif isinstance(obj, (list, tuple, set)):
        for value in obj:
            patch_loaded_estimators(value, seen)
    else:
        attributes = getattr(obj, "__dict__", None)
        if isinstance(attributes, dict):
            for value in attributes.values():
                if isinstance(value, np.ndarray):
                    continue
                patch_loaded_estimators(value, seen)


def load_model_package() -> Dict[str, Any]:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

    install_sklearn_compatibility_patch()
    package = joblib.load(MODEL_PATH)
    patch_loaded_estimators(package)
    return package


def read_input() -> Dict[str, float]:
    raw_input = sys.stdin.read().strip()
    if not raw_input:
        raise ValueError("No JSON input received.")

    payload = json.loads(raw_input)
    if not isinstance(payload, dict):
        raise ValueError("Input must be a JSON object.")

    cleaned: Dict[str, float] = {}
    for feature in REQUIRED_FEATURES:
        if feature not in payload:
            raise ValueError(f"Missing required feature: {feature}")
        value = float(payload[feature])
        if not np.isfinite(value):
            raise ValueError(f"Invalid value for feature: {feature}")
        if feature == "ph" and not (0 <= value <= 14):
            raise ValueError("pH must be between 0 and 14.")
        if feature != "ph" and value < 0:
            raise ValueError(f"{feature} cannot be negative.")
        cleaned[feature] = value

    return cleaned


def get_class_probability(model: Any, x_frame: pd.DataFrame, class_label: int) -> float:
    probabilities = model.predict_proba(x_frame)

    model_classes = getattr(model, "classes_", None)
    if model_classes is None and hasattr(model, "named_steps"):
        model_classes = model.named_steps["model"].classes_
    if model_classes is None:
        raise ValueError("Could not read model class labels.")

    class_index = list(model_classes).index(class_label)
    return float(probabilities[:, class_index][0])


def assign_risk_level(risk_probability: float, low_threshold: float, high_threshold: float) -> str:
    if risk_probability < low_threshold:
        return "Low Risk"
    if risk_probability < high_threshold:
        return "Moderate Risk"
    return "High Risk"


def predict(package: Dict[str, Any], input_values: Dict[str, float]) -> Dict[str, Any]:
    feature_names = package.get("feature_names", REQUIRED_FEATURES)
    x_frame = pd.DataFrame([{feature: float(input_values[feature]) for feature in feature_names}])

    final_model = package["model"]
    risk_probability = get_class_probability(final_model, x_frame, class_label=0)
    potable_probability = get_class_probability(final_model, x_frame, class_label=1)

    final_threshold = float(package.get("final_threshold_for_class_1", 0.5))
    predicted_class = int(potable_probability >= final_threshold)
    predicted_label = package.get("target_mapping", {}).get(
        predicted_class,
        "Potable / Safer water profile" if predicted_class == 1 else "Non-potable / Risky water profile",
    )

    threshold_values = package.get("risk_threshold_values", {})
    low_threshold = float(threshold_values.get("low_risk_upper_bound", 0.4))
    high_threshold = float(threshold_values.get("high_risk_lower_bound", 0.7))

    risk_level = assign_risk_level(risk_probability, low_threshold, high_threshold)
    recommended_action = package.get("risk_action_mapping", {}).get(
        risk_level,
        "Use this screening result with laboratory confirmation and public-health guidance.",
    )

    anomaly_preprocessor = package.get("anomaly_preprocessor")
    anomaly_model = package.get("anomaly_model")
    anomaly_status = "Not available"
    anomaly_score = 0.0
    if anomaly_preprocessor is not None and anomaly_model is not None:
        anomaly_ready = anomaly_preprocessor.transform(x_frame)
        anomaly_prediction = int(anomaly_model.predict(anomaly_ready)[0])
        anomaly_score = float(-anomaly_model.decision_function(anomaly_ready)[0])
        anomaly_status = "Unusual Water Profile" if anomaly_prediction == -1 else "Normal Water Profile"

    cluster_preprocessor = package.get("cluster_preprocessor")
    cluster_model = package.get("cluster_model")
    cluster_id = -1
    if cluster_preprocessor is not None and cluster_model is not None:
        cluster_ready = cluster_preprocessor.transform(x_frame)
        cluster_id = int(cluster_model.predict(cluster_ready)[0])

    return {
        "model_summary": {
            "selected_model": package.get("selected_model", "Unknown model"),
            "final_threshold_for_class_1": final_threshold,
            "calibration_note": package.get("calibration_note", "Probability calibration note unavailable."),
        },
        "probabilities": {
            "non_potable_risky_0": risk_probability,
            "potable_safer_1": potable_probability,
        },
        "prediction": {
            "predicted_class": predicted_class,
            "predicted_label": predicted_label,
            "risk_level": risk_level,
            "recommended_action": recommended_action,
            "risk_alert": "Alert" if risk_level in {"Moderate Risk", "High Risk"} else "No Alert",
        },
        "anomaly": {
            "status": anomaly_status,
            "score": anomaly_score,
        },
        "cluster": {
            "id": cluster_id,
            "label": f"Cluster {cluster_id}" if cluster_id >= 0 else "Not available",
        },
        "input": {feature: float(input_values[feature]) for feature in feature_names},
        "disclaimer": (
            "This is an environmental water-quality screening result, not a clinical CKDu diagnosis. "
            "Confirm risky results through certified laboratory testing and official health guidance."
        ),
    }


def main() -> None:
    try:
        input_values = read_input()
        package = load_model_package()
        result = predict(package, input_values)
        print(json.dumps(result), flush=True)
    except Exception as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stderr, flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()

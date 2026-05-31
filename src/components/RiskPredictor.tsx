"use client";

import { FormEvent, useMemo, useState } from "react";
import { sampleWaterInput, waterFeatures } from "@/lib/featureMeta";

type PredictionResult = {
  model_summary: {
    selected_model: string;
    final_threshold_for_class_1: number;
    calibration_note: string;
  };
  probabilities: {
    non_potable_risky_0: number;
    potable_safer_1: number;
  };
  prediction: {
    predicted_class: number;
    predicted_label: string;
    risk_level: "Low Risk" | "Moderate Risk" | "High Risk";
    recommended_action: string;
    risk_alert: "Alert" | "No Alert";
  };
  anomaly: {
    status: string;
    score: number;
  };
  cluster: {
    id: number;
    label: string;
  };
  input: Record<string, number>;
  disclaimer: string;
};

type ApiError = {
  error: string;
  details?: string;
};

const riskStyles = {
  "Low Risk": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Moderate Risk": "border-amber-200 bg-amber-50 text-amber-700",
  "High Risk": "border-red-200 bg-red-50 text-red-700"
};

function toPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function RiskPredictor() {
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(waterFeatures.map((feature) => [feature.key, String(sampleWaterInput[feature.key])]))
  );
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const missingCount = useMemo(
    () => waterFeatures.filter((feature) => form[feature.key] === "" || Number.isNaN(Number(form[feature.key]))).length,
    [form]
  );

  function updateField(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function loadSample() {
    setForm(Object.fromEntries(waterFeatures.map((feature) => [feature.key, String(sampleWaterInput[feature.key])])));
    setError(null);
  }

  function clearForm() {
    setForm(Object.fromEntries(waterFeatures.map((feature) => [feature.key, ""])));
    setResult(null);
    setError(null);
  }

  async function submitPrediction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    const payload = Object.fromEntries(
      waterFeatures.map((feature) => [feature.key, Number(form[feature.key])])
    ) as Record<string, number>;

    const invalidFeature = waterFeatures.find((feature) => {
      const value = payload[feature.key];
      if (!Number.isFinite(value)) return true;
      if (typeof feature.min === "number" && value < feature.min) return true;
      if (typeof feature.max === "number" && value > feature.max) return true;
      return false;
    });

    if (invalidFeature) {
      setError(`Please enter a valid value for ${invalidFeature.label}.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as PredictionResult | ApiError;

      if (!response.ok) {
        const apiError = data as ApiError;
        throw new Error(apiError.details || apiError.error || "Prediction failed.");
      }

      setResult(data as PredictionResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft lg:p-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-river">Prediction form</p>
            <h2 className="mt-2 text-3xl font-black text-ink">Enter water-quality values</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Use values from a water-quality report. All inputs are processed by the uploaded CKDu water-risk model package.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadSample}
              className="rounded-full border border-teal-200 px-4 py-2 text-sm font-bold text-river transition hover:bg-mint"
            >
              Load sample
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>

        <form onSubmit={submitPrediction} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {waterFeatures.map((feature) => (
              <label key={feature.key} className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition focus-within:border-river focus-within:bg-white focus-within:shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-ink">{feature.label}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 shadow-sm">{feature.unit}</span>
                </div>
                <input
                  type="number"
                  step="any"
                  min={feature.min}
                  max={feature.max}
                  placeholder={feature.placeholder}
                  value={form[feature.key] ?? ""}
                  onChange={(event) => updateField(feature.key, event.target.value)}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg font-bold text-ink outline-none transition focus:border-river focus:ring-4 focus:ring-teal-100"
                />
                <span className="mt-3 block text-xs leading-5 text-slate-500">{feature.description}</span>
              </label>
            ))}
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || missingCount > 0}
            className="w-full rounded-2xl bg-ink px-6 py-4 text-base font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-river disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? "Running model prediction..." : "Analyze water risk"}
          </button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft lg:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-river">Model result</p>
        {!result ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint text-2xl font-black text-river">
              ML
            </div>
            <h3 className="mt-5 text-2xl font-black text-ink">No prediction yet</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Submit the form to view risk probability, final risk level, anomaly status, cluster assignment, and recommendation.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className={`rounded-[1.5rem] border p-5 ${riskStyles[result.prediction.risk_level]}`}>
              <p className="text-sm font-bold uppercase tracking-[0.18em]">Final warning level</p>
              <h3 className="mt-2 text-4xl font-black">{result.prediction.risk_level}</h3>
              <p className="mt-3 text-sm font-semibold">{result.prediction.recommended_action}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ProbabilityCard
                title="Risky / Non-potable probability"
                value={result.probabilities.non_potable_risky_0}
              />
              <ProbabilityCard
                title="Safer / Potable probability"
                value={result.probabilities.potable_safer_1}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="Binary prediction" value={result.prediction.predicted_label} />
              <InfoCard title="Risk alert" value={result.prediction.risk_alert} />
              <InfoCard title="Anomaly status" value={result.anomaly.status} detail={`Score: ${result.anomaly.score.toFixed(3)}`} />
              <InfoCard title="Water profile cluster" value={result.cluster.label} />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-ink">Model details</p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <p>Selected model: <strong>{result.model_summary.selected_model}</strong></p>
                <p>Potable-class threshold: <strong>{result.model_summary.final_threshold_for_class_1.toFixed(2)}</strong></p>
                <p>{result.model_summary.calibration_note}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5 text-sm leading-6 text-cyan-900">
              {result.disclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProbabilityCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-bold text-slate-600">{title}</p>
      <p className="mt-3 text-3xl font-black text-ink">{toPercent(value)}</p>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-river" style={{ width: toPercent(value) }} />
      </div>
    </div>
  );
}

function InfoCard({ title, value, detail }: { title: string; value: string; detail?: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 text-base font-black text-ink">{value}</p>
      {detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}
    </div>
  );
}

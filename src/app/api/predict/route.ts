import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";

export const runtime = "nodejs";

type WaterInput = Record<string, number>;

const REQUIRED_FEATURES = [
  "ph",
  "Hardness",
  "Solids",
  "Chloramines",
  "Sulfate",
  "Conductivity",
  "Organic_carbon",
  "Trihalomethanes",
  "Turbidity"
];

function validatePayload(payload: unknown): { valid: true; data: WaterInput } | { valid: false; message: string } {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { valid: false, message: "Request body must be a JSON object." };
  }

  const raw = payload as Record<string, unknown>;
  const data: WaterInput = {};

  for (const feature of REQUIRED_FEATURES) {
    const value = raw[feature];
    const numericValue = typeof value === "number" ? value : Number(value);

    if (!Number.isFinite(numericValue)) {
      return { valid: false, message: `Invalid or missing value for ${feature}.` };
    }

    if (numericValue < 0 && feature !== "ph") {
      return { valid: false, message: `${feature} cannot be negative.` };
    }

    if (feature === "ph" && (numericValue < 0 || numericValue > 14)) {
      return { valid: false, message: "pH must be between 0 and 14." };
    }

    data[feature] = numericValue;
  }

  return { valid: true, data };
}

function runPythonPrediction(payload: WaterInput): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const pythonCommand = process.env.PYTHON_PATH || (process.platform === "win32" ? "python" : "python3");
    const scriptPath = path.join(process.cwd(), "ml", "predict.py");

    const child = spawn(pythonCommand, [scriptPath], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PYTHONWARNINGS: "ignore"
      },
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Prediction timed out while loading or running the model."));
    }, 120000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(new Error(`Unable to start Python. Check PYTHON_PATH and Python dependencies. ${error.message}`));
    });

    child.on("close", (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        reject(new Error(stderr || stdout || `Python process exited with code ${code}.`));
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`Model returned invalid JSON. Output: ${stdout || stderr}`));
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const validation = validatePayload(payload);

    if (!validation.valid) {
      return NextResponse.json({ error: "Invalid input", details: validation.message }, { status: 400 });
    }

    const prediction = await runPythonPrediction(validation.data);
    return NextResponse.json(prediction);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Prediction failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

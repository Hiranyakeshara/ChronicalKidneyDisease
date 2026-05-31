# CKDu Water Risk Screening Website

A Next.js web application for CKDu-related water-risk screening using water-quality inputs and a machine-learning model.

## What this package includes

- Next.js frontend in `src/`
- Vercel Python API endpoint in `api/predict.py`
- Machine-learning logic in `ml/predict.py`
- Model package in `ml/model/ckdu_water_risk_model_package.pkl`
- Root `requirements.txt` for Vercel Python dependency installation
- Vercel config in `vercel.json`

## Important folder structure

```text
.
├── api/
│   └── predict.py                  # Vercel Python API endpoint: /api/predict
├── ml/
│   ├── model/
│   │   └── ckdu_water_risk_model_package.pkl
│   ├── predict.py                  # ML loading + prediction logic
│   └── requirements.txt
├── src/                            # Next.js frontend
├── requirements.txt                # Python dependencies for Vercel
├── package.json                    # Next.js dependencies
├── vercel.json
└── .gitignore
```

## How prediction works

```text
Frontend form → POST /api/predict → Python model loads .pkl file → JSON result → frontend displays risk output
```

The frontend already calls:

```ts
fetch("/api/predict", { method: "POST", ... })
```

## Deploying to Vercel

1. Push this full project to GitHub.
2. Go to Vercel.
3. Select **Add New Project**.
4. Import the GitHub repository.
5. Use these settings:

```text
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Install Command: npm install
Output Directory: Default / leave empty
```

6. Deploy.

No `PYTHON_PATH` variable is needed on Vercel. The Python function uses the root `requirements.txt`.

## Local frontend testing

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

For local full-stack testing with the Python API, use Vercel CLI:

```bash
npm install -g vercel
python -m venv ml/.venv
ml/.venv/Scripts/activate      # Windows PowerShell/CMD may differ
pip install -r requirements.txt
vercel dev
```

Then open the local Vercel URL shown in the terminal.

## Manual model test

```bash
python ml/predict.py
```

Paste one JSON object into stdin, for example:

```json
{"ph":7.1,"Hardness":205,"Solids":21000,"Chloramines":7.2,"Sulfate":330,"Conductivity":420,"Organic_carbon":14.5,"Trihalomethanes":66,"Turbidity":3.8}
```

## Files not to upload manually

Do not upload these to GitHub:

```text
node_modules
.next
ml/.venv
.env.local
zip files
```

The project keeps only one model file at:

```text
ml/model/ckdu_water_risk_model_package.pkl
```

Do not add another duplicate model file directly inside `ml/`.

## Disclaimer

This application is for environmental water-quality screening support only. It is not a clinical CKDu diagnosis tool.

# CKDu Water Risk Screening Website

A polished **Next.js model-integrated website** for community-level CKDu water-risk awareness. The app connects a public-facing prediction form to the uploaded `ckdu_water_risk_model_package.pkl` model package.

## What this website does

- Provides a landing page explaining the purpose of the system.
- Accepts nine water-quality input values:
  - pH
  - Hardness
  - Total dissolved solids
  - Chloramines
  - Sulfate
  - Conductivity
  - Organic carbon
  - Trihalomethanes
  - Turbidity
- Sends the values to a Next.js API route.
- The API route calls the Python model bridge.
- The Python bridge loads the trained pickle model package and returns:
  - Non-potable / risky water probability
  - Potable / safer water probability
  - Low / Moderate / High risk level
  - Recommended action
  - Anomaly status
  - Water-quality cluster

## Important scope note

This is an **environmental water-quality screening tool**. It is **not a clinical CKDu diagnosis system** and must not replace certified laboratory testing, medical advice, or official public-health guidance.

## Project structure

```text
ckdu-water-risk-nextjs/
├── src/
│   ├── app/
│   │   ├── api/predict/route.ts     # Next.js API route that calls Python
│   │   ├── globals.css              # Tailwind global styling
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   └── RiskPredictor.tsx        # Main model input/output UI
│   └── lib/
│       └── featureMeta.ts           # Feature labels and sample values
├── ml/
│   ├── model/
│   │   └── ckdu_water_risk_model_package.pkl
│   ├── predict.py                   # Python prediction bridge
│   └── requirements.txt             # Python dependencies
├── package.json
└── README.md
```

## Setup instructions

### 1. Install Node dependencies

```bash
npm install
```

### 2. Create and activate a Python virtual environment

#### Windows PowerShell

```powershell
cd ml
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

#### macOS / Linux

```bash
cd ml
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 3. Set the Python path

Create a `.env.local` file in the project root.

#### Windows

```env
PYTHON_PATH=.\ml\.venv\Scripts\python.exe
```

#### macOS / Linux

```env
PYTHON_PATH=./ml/.venv/bin/python
```

### 4. Run the website

```bash
npm run dev
```

Open the local address shown in the terminal, usually:

```text
http://localhost:3000
```

## Test the model bridge directly

From the project root, run:

```bash
python ml/predict.py
```

Then paste this JSON and press Enter:

```json
{"ph":7.1,"Hardness":205,"Solids":21000,"Chloramines":7.2,"Sulfate":330,"Conductivity":420,"Organic_carbon":14.5,"Trihalomethanes":66,"Turbidity":3.8}
```

The script should return a JSON prediction.

## Deployment note

This package is ideal for local demonstration and final project submission. For real public deployment, use a persistent Python API backend such as FastAPI because the pickle model is large and should be loaded once when the backend starts. The current Next.js API route starts Python on demand, which is simple and reliable for coursework demos but slower on the first prediction.

## Model package included

The uploaded model file is already included here:

```text
ml/model/ckdu_water_risk_model_package.pkl
```

Do not rename it unless you also update `ml/predict.py`.

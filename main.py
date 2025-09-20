from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(title="Aarogya Sahayak Risk Predictor")

# Models folder
MODEL_PATH = "models/risk_model.pkl"
SCALER_PATH = "models/scaler.pkl"

# Lazy load model + scaler
_model = None
_scaler = None

def load_model_and_scaler():
    global _model, _scaler
    if _model is None or _scaler is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
            raise FileNotFoundError("Model or scaler file not found!")
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
    return _model, _scaler

# Risk mapping
def risk_category(prob):
    if prob < 0.4:
        return "Low Risk", "Green"
    elif prob < 0.7:
        return "Medium Risk", "Amber"
    else:
        return "High Risk", "Red"

# Input model
class Vitals(BaseModel):
    glucose: float
    blood_pressure: float
    bmi: float

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict_risk")
def predict_risk_endpoint(vitals: Vitals):
    try:
        model, scaler = load_model_and_scaler()
        X_scaled = scaler.transform(np.array([[vitals.glucose, vitals.blood_pressure, vitals.bmi]]))
        prob = model.predict_proba(X_scaled)[0][1]
        label, color = risk_category(prob)
        return {"risk_category": label, "probability": round(prob, 2), "color": color}
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

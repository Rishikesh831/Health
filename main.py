# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from risk_predictor import predict_risk

app = FastAPI(title="Aarogya Sahayak Risk Predictor")

class Vitals(BaseModel):
    glucose: float
    blood_pressure: float
    bmi: float

@app.post("/predict_risk")
def risk_endpoint(vitals: Vitals):
    label, prob, color = predict_risk(vitals.glucose, vitals.blood_pressure, vitals.bmi)
    # Optional alert for ASHA
    if label == "High Risk":
        print(f"ALERT: Patient high risk! Notify ASHA.")
    return {"risk_category": label, "probability": prob, "color": color}

# risk_predictor.py
import joblib
import numpy as np

# Load saved model and scaler
MODEL_PATH = "risk_model.pkl"
SCALER_PATH = "scaler.pkl"

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

# Map probability to risk category
def risk_category(prob):
    if prob < 0.4:
        return "Low Risk", "Green"
    elif prob < 0.7:
        return "Medium Risk", "Amber"
    else:
        return "High Risk", "Red"

# Main function to call from your app
def predict_risk(glucose: float, blood_pressure: float, bmi: float):
    """
    Input:
        glucose (mg/dL), blood_pressure (mmHg), bmi (kg/m^2)
    Output:
        risk_label (Low/Medium/High), probability, color
    """
    # Scale input
    X_scaled = scaler.transform(np.array([[glucose, blood_pressure, bmi]]))
    # Predict probability of high risk
    prob = model.predict_proba(X_scaled)[0][1]
    # Map to risk category + color
    label, color = risk_category(prob)
    return label, round(prob, 2), color

# Optional test
if __name__ == "__main__":
    test_glucose = 220
    test_bp = 90
    test_bmi = 27
    label, prob, color = predict_risk(test_glucose, test_bp, test_bmi)
    print(f"Predicted Risk: {label}, Probability: {prob}, Color: {color}")

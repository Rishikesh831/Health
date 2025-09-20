import React, { useState } from 'react';
import './HealthMetricsForm.css';

interface HealthMetrics {
  glucose: number;
  systolic: number;
  diastolic: number;
  weight: number;
  height: number;
  bmi: number;
}

interface ApiResponse {
  prediction: number;
  probability: number;
}

export const HealthMetricsForm: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    glucose: 0,
    systolic: 0,
    diastolic: 0,
    weight: 0,
    height: 0,
    bmi: 0,
  });
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateBMI = () => {
    const heightInMeters = metrics.height / 100;
    const bmi = metrics.weight / (heightInMeters * heightInMeters);
    return parseFloat(bmi.toFixed(2));
  };

  const callHealthApi = async (bmi: number) => {
    try {
      const response = await fetch('https://health-uxaj.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Glucose: metrics.glucose,
          BloodPressure: metrics.systolic,
          BMI: bmi,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const bmi = calculateBMI();
      setMetrics(prev => ({ ...prev, bmi }));
      const response = await callHealthApi(bmi);
      setApiResponse(response);
    } catch (error) {
      console.error('Error:', error);
      setApiResponse({ prediction: -1, probability: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getPredictionMessage = (prediction: number, probability: number) => {
    const probabilityPercentage = (probability * 100).toFixed(2);
    if (prediction === 1) {
      return `Risk Detected: There is a ${probabilityPercentage}% chance of diabetes risk.`;
    }
    return `Low Risk: There is a ${probabilityPercentage}% chance of being healthy.`;
  };

  return (
    <div className="health-metrics-container">
      <h2>Health Metrics Calculator</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Glucose (mg/dL):</label>
          <input
            type="number"
            value={metrics.glucose || ''}
            onChange={(e) => setMetrics(prev => ({ ...prev, glucose: parseFloat(e.target.value) }))}
            required
          />
        </div>

        <div className="form-group">
          <label>Blood Pressure (mmHg):</label>
          <div className="bp-inputs">
            <input
              type="number"
              placeholder="Systolic"
              value={metrics.systolic || ''}
              onChange={(e) => setMetrics(prev => ({ ...prev, systolic: parseFloat(e.target.value) }))}
              required
            />
            <input
              type="number"
              placeholder="Diastolic"
              value={metrics.diastolic || ''}
              onChange={(e) => setMetrics(prev => ({ ...prev, diastolic: parseFloat(e.target.value) }))}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Weight (kg):</label>
          <input
            type="number"
            value={metrics.weight || ''}
            onChange={(e) => setMetrics(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
            required
          />
        </div>

        <div className="form-group">
          <label>Height (cm):</label>
          <input
            type="number"
            value={metrics.height || ''}
            onChange={(e) => setMetrics(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
            required
          />
        </div>

        <button type="submit">Calculate</button>
      </form>

      {loading && <div className="loading">Processing...</div>}

      {metrics.bmi > 0 && !loading && (
        <div className="results">
          <h3>Results:</h3>
          <p>BMI: {metrics.bmi}</p>
          <p>Glucose Level: {metrics.glucose} mg/dL</p>
          <p>Blood Pressure: {metrics.systolic}/{metrics.diastolic} mmHg</p>
          
          {apiResponse && (
            <div className="api-response">
              <h4>AI Analysis Result:</h4>
              <p className={apiResponse.prediction === 1 ? 'warning' : 'normal'}>
                {getPredictionMessage(apiResponse.prediction, apiResponse.probability)}
              </p>
              <div className="prediction-details">
                <p>Prediction: {apiResponse.prediction === 1 ? 'High Risk' : 'Low Risk'}</p>
                <p>Confidence: {(apiResponse.probability * 100).toFixed(2)}%</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

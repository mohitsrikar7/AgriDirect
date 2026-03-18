from fastapi import FastAPI
import joblib
import numpy as np

# 1️⃣ Create FastAPI app
app = FastAPI()

# 2️⃣ Load trained model and encoders
model = joblib.load("crop_model.pkl")
soil_encoder = joblib.load("soil_encoder.pkl")
crop_encoder = joblib.load("crop_encoder.pkl")

print("ML Model Loaded Successfully")

# 3️⃣ Prediction Route
@app.post("/predict")
def predict(data: dict):
    try:
        temperature = float(data["temperature"])
        humidity = float(data["humidity"])
        rainfall = float(data["rainfall"])
        soil_type = data["soilType"]

        # Encode soil type
        soil_encoded = soil_encoder.transform([soil_type])[0]

        # Prepare features
        features = np.array([[temperature, humidity, rainfall, soil_encoded]])

        # Get probabilities
        probabilities = model.predict_proba(features)[0]

        # Get top 3 predictions
        top3_indices = probabilities.argsort()[-3:][::-1]

        recommendations = []

        for idx in top3_indices:
            recommendations.append({
                "crop": crop_encoder.inverse_transform([idx])[0],
                "confidence": float(probabilities[idx])
            })

        return {
            "recommendations": recommendations
        }

    except Exception as e:
        return {"error": str(e)}
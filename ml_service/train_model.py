import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib

# 1️⃣ Load dataset
data = pd.read_csv("Crop_recommendation.csv")

print("Dataset Loaded Successfully")
print(data.head())

# 2️⃣ Select only features we can get from OpenWeather
# We will use:
# temperature, humidity, rainfall, and create soilType manually

data = data[["temperature", "humidity", "rainfall", "label"]]

# 3️⃣ Create synthetic soilType based on rainfall (simple academic approach)
def assign_soil_type(rainfall):
    if rainfall > 250:
        return "black"
    elif rainfall > 200:
        return "clay"
    elif rainfall > 150:
        return "alluvial"
    elif rainfall > 100:
        return "loamy"
    elif rainfall > 60:
        return "red"
    elif rainfall > 30:
        return "laterite"
    else:
        return "sandy"

data["soilType"] = data["rainfall"].apply(assign_soil_type)

# 4️⃣ Encode soilType
soil_encoder = LabelEncoder()
data["soilType"] = soil_encoder.fit_transform(data["soilType"])

# 5️⃣ Encode crop labels
crop_encoder = LabelEncoder()
data["label"] = crop_encoder.fit_transform(data["label"])

# 6️⃣ Define features and target
X = data[["temperature", "humidity", "rainfall", "soilType"]]
y = data["label"]

# 7️⃣ Train/Test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 8️⃣ Train model
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# 9️⃣ Evaluate model
accuracy = model.score(X_test, y_test)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# 🔟 Save model and encoders
joblib.dump(model, "crop_model.pkl")
joblib.dump(soil_encoder, "soil_encoder.pkl")
joblib.dump(crop_encoder, "crop_encoder.pkl")

print("Model and encoders saved successfully.")
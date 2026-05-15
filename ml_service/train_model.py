import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix, ConfusionMatrixDisplay
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# 1️⃣ Load dataset
data = pd.read_csv(BASE_DIR / "Crop_recommendation.csv")

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
y_pred = model.predict(X_test)
precision = precision_score(y_test, y_pred, average='weighted')
recall = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')
cm = confusion_matrix(y_test, y_pred)
cm_df = pd.DataFrame(cm, index=crop_encoder.classes_, columns=crop_encoder.classes_)

print(f"Model Accuracy: {accuracy * 100:.2f}%")
print(f"Model Precision: {precision * 100:.2f}%")
print(f"Model Recall: {recall * 100:.2f}%")
print(f"Model F1-Score: {f1 * 100:.2f}%")
print("Confusion Matrix:")
print(cm_df)

# Save confusion matrix for the project report
cm_df.to_csv(BASE_DIR / "confusion_matrix.csv")

try:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(12, 10))
    display = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=crop_encoder.classes_)
    display.plot(ax=ax, cmap="Blues", colorbar=True, xticks_rotation=45)
    ax.set_title("Crop Recommendation Confusion Matrix")
    plt.tight_layout()
    plt.savefig(BASE_DIR / "confusion_matrix.png", dpi=300, bbox_inches="tight")
    plt.close(fig)
    print("Confusion matrix saved as confusion_matrix.csv and confusion_matrix.png")
except ImportError:
    print("matplotlib is not installed, so only confusion_matrix.csv was saved.")

# 🔟 Save model and encoders
joblib.dump(model, BASE_DIR / "crop_model.pkl")
joblib.dump(soil_encoder, BASE_DIR / "soil_encoder.pkl")
joblib.dump(crop_encoder, BASE_DIR / "crop_encoder.pkl")

print("Model and encoders saved successfully.")
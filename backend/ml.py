import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.metrics import accuracy_score, mean_squared_error
import joblib

# Load dataset
training_name = 'haoze2'
data_path = f'backend/datasets/{training_name}_algorithm.csv'
df = pd.read_csv(data_path)

# Extract columns
posture_labels = df.iloc[:, 0]  # First column: posture state
hip_angles = df.iloc[:, 1]  # Second column: hip angle
neck_angles = df.iloc[:, 2]  # Third column: neck angle
coordinates = df.iloc[:, 3:]  # Remaining columns: x, y components of 33 coordinates

# Encode posture labels
label_encoder = LabelEncoder()
posture_labels_encoded = label_encoder.fit_transform(posture_labels)

# Normalize coordinate values
scaler = StandardScaler()
coordinates_scaled = scaler.fit_transform(coordinates)

# Split data
X_train, X_test, y_train_cls, y_test_cls = train_test_split(coordinates_scaled, posture_labels_encoded, test_size=0.2, random_state=42)
X_train, X_test, y_train_hip, y_test_hip = train_test_split(coordinates_scaled, hip_angles, test_size=0.2, random_state=42)
X_train, X_test, y_train_neck, y_test_neck = train_test_split(coordinates_scaled, neck_angles, test_size=0.2, random_state=42)

# Train posture classification model
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train_cls)
y_pred_cls = clf.predict(X_test)
accuracy = accuracy_score(y_test_cls, y_pred_cls)
print(f'Posture Classification Accuracy: {accuracy:.2f}')

# Train regression models for angle prediction
hip_reg = LinearRegression()
hip_reg.fit(X_train, y_train_hip)
y_pred_hip = hip_reg.predict(X_test)
mse_hip = mean_squared_error(y_test_hip, y_pred_hip)
print(f'Hip Angle Prediction MSE: {mse_hip:.2f}')

neck_reg = LinearRegression()
neck_reg.fit(X_train, y_train_neck)
y_pred_neck = neck_reg.predict(X_test)
mse_neck = mean_squared_error(y_test_neck, y_pred_neck)
print(f'Neck Angle Prediction MSE: {mse_neck:.2f}')

joblib.dump(clf, "backend/models/posture_classifier.pkl")
joblib.dump(hip_reg, "backend/models/hip_regressor.pkl")
joblib.dump(neck_reg, "backend/models/neck_regressor.pkl")
joblib.dump(scaler, "backend/models/scaler.pkl")
joblib.dump(label_encoder, "backend/models/label_encoder.pkl")

print("Models saved successfully!")

# def predict_single_frame(frame):
#     frame = np.array(frame).reshape(1, -1)  # Ensure it's in the correct shape
#     frame_scaled = scaler.transform(frame)  # Apply the same scaling
#     prediction = clf.predict(frame_scaled)  # Predict posture state
#     return label_encoder.inverse_transform(prediction)[0]

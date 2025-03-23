import joblib
import numpy as np
import pandas as pd

clf = joblib.load("backend/models/posture_classifier.pkl")
hip_reg = joblib.load("backend/models/hip_regressor.pkl")
neck_reg = joblib.load("backend/models/neck_regressor.pkl")
scaler = joblib.load("backend/models/scaler.pkl")
label_encoder = joblib.load("backend/models/label_encoder.pkl")

def predict_single_frame(frame):
    frame = np.array(frame).reshape(1, -1)  # Ensure it's in the correct shape
    frame_scaled = scaler.transform(frame)  # Apply the same scaling
    prediction = clf.predict(frame_scaled)  # Predict posture state
    return label_encoder.inverse_transform(prediction)[0]  # Return single label
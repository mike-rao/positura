import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.metrics import accuracy_score, mean_squared_error
import csv
import matplotlib.pyplot as plt

# Load dataset
name = 'haoze'
data_path = f'backend/datasets/{name}_algorithm.csv'
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

def predict_posture(new_csv_path):
    new_data = pd.read_csv(new_csv_path)
    new_data_scaled = scaler.transform(new_data)  # Apply the same scaling
    predictions = clf.predict(new_data_scaled)  # Predict posture states
    predicted_labels = label_encoder.inverse_transform(predictions)  # Convert back to original labels
    return predicted_labels

def predict_single_frame(frame):
    frame = np.array(frame).reshape(1, -1)  # Ensure it's in the correct shape
    frame_scaled = scaler.transform(frame)  # Apply the same scaling
    prediction = clf.predict(frame_scaled)  # Predict posture state
    return label_encoder.inverse_transform(prediction)[0]

test_path = f'backend/datasets/{name}.csv'
predicted_postures = predict_posture(test_path)
#print(predicted_postures)
given_postures = []
with open(data_path, 'r', newline='') as file:
    reader = csv.reader(file)  # Create a CSV reader object
    for row in reader:
        if row:
            given_postures.append(row[0])

given_graph = []
given_height = 0

for i in range(len(given_postures)):
    given_graph.append(given_height)
    if given_postures[i] == 'Good':
        given_height += 1
    else:
        given_height -= 1

predicted_graph = []
predicted_height = 0

for i in range(len(predicted_postures)):
    predicted_graph.append(predicted_height)
    if predicted_postures[i] == 'Good':
        predicted_height += 1
    else:
        predicted_height -= 1

indices = range(len(given_postures))
indicies2 = range(len(predicted_postures))

# Plot both arrays
plt.plot(indices, given_postures, marker='o', label='given', linestyle='-')
plt.plot(indicies2, predicted_postures, marker='s', label='predicted', linestyle='--')

# Labels and title
plt.xlabel('Index')
plt.ylabel('Value')
plt.title('Array Values vs. Index')

# Show legend
plt.legend()

# Display the plot
plt.show()
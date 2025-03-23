#best with neck
import cv2
import mediapipe as mp
import numpy as np
import csv
import os
from ml_functions import predict_single_frame

# !!!!!!!CHANGE AS NEEDED!!!!!!!
camera = False
name = 'haoze'

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Function to calculate the angle between three points
def calculate_angle(p1, p2, p3):
    if None in (p1, p2, p3):  
        return None  

    a, b, c = np.array(p1), np.array(p2), np.array(p3)
    ba = a - b
    bc = c - b

    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)

    if norm_ba == 0 or norm_bc == 0:
        return None  

    cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0)) * 180.0 / np.pi
    return angle

# Input and output video paths

#COMMENT OUT IF USING LIVE FEED
input_video_path = f'videos/test_{name}.MOV'  

output_video_path = f'videos/test_vids/ml/test_{name}.MOV'

# Open video PICK ONE
if not camera:  
    cap = cv2.VideoCapture(input_video_path)
else:
    cap = cv2.VideoCapture(0)


if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

# Get video properties CHOOSE ONE
if not camera:
    fps = int(cap.get(cv2.CAP_PROP_FPS))
else:
    fps = 30

# Set resized dimensions
new_width, new_height = 720, 400

# Define the codec and create VideoWriter object
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_video_path, fourcc, fps, (new_height, new_width))  

# Setup CSV
filename = f'backend/ml/{name}.csv'
if os.path.exists(filename):
    os.remove(filename)

# Process video
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Resize frame
    frame_resized = cv2.resize(frame, (new_width, new_height))

    # Convert to RGB for MediaPipe
    image = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)
    results = pose.process(image)

    # Convert back to BGR for OpenCV
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    hip_angle, neck_angle = None, None  
    posture_status, neck_status = "Unknown", "Unknown"

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark

        try:
            coordinates = []
            for i in range(len(landmarks)):
                if i in [0,11,12,23,25]:
                    coordinates.append(landmarks[i].x * new_width)
                    coordinates.append(landmarks[i].y * new_height)
            posture_status = predict_single_frame(coordinates)

            # Extract keypoints
            left_shoulder = (int(landmarks[11].x * new_width), int(landmarks[11].y * new_height))
            right_shoulder = (int(landmarks[12].x * new_width), int(landmarks[12].y * new_height))
            left_hip = (int(landmarks[23].x * new_width), int(landmarks[23].y * new_height))
            left_knee = (int(landmarks[25].x * new_width), int(landmarks[25].y * new_height))
            nose = (int(landmarks[0].x * new_width), int(landmarks[0].y * new_height))

            # Chest midpoint (average of shoulders)
            chest_x = (left_shoulder[0] + right_shoulder[0]) // 2
            chest_y = (left_shoulder[1] + right_shoulder[1]) // 2
            chest = (chest_x, chest_y)

            # Neck position (slightly above chest)
            neck = (chest_x, chest_y - 20)  

            # Calculate angles
            hip_angle = calculate_angle(left_shoulder, left_hip, left_knee)
            neck_angle = calculate_angle(nose, left_shoulder, left_hip)

        except Exception as e:
            print(f"Error processing landmarks: {e}")

        # Draw pose landmarks
        mp_drawing.draw_landmarks(
            image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2)
        )

        # Draw hip angle visualization
        if hip_angle is not None:
            cv2.line(image, left_shoulder, left_hip, (255, 255, 0), 3)
            cv2.line(image, left_hip, left_knee, (255, 255, 0), 3)
            cv2.circle(image, left_shoulder, 5, (0, 0, 255), -1)
            cv2.circle(image, left_hip, 5, (0, 255, 0), -1)
            cv2.circle(image, left_knee, 5, (255, 0, 0), -1)

        # Draw neck angle visualization
        if neck_angle is not None:
            cv2.line(image, nose, left_shoulder, (0, 255, 255), 3)
            cv2.line(image, left_shoulder, left_hip, (0, 255, 255), 3)
            cv2.circle(image, nose, 5, (255, 165, 0), -1)
            cv2.circle(image, left_shoulder, 5, (0, 165, 255), -1)
            cv2.circle(image, left_hip, 5, (165, 42, 42), -1)

    # Rotate the frame 90 degrees clockwise
    if fps !=30:
        image_rotated = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)

        # Add text AFTER rotation to keep it upright
        if hip_angle is not None:
            cv2.putText(image_rotated, f"Hip Angle: {hip_angle:.1f}", (10, 90),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
        if neck_angle is not None:
            cv2.putText(image_rotated, f"Neck Angle: {neck_angle:.1f}", (10, 130),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
        cv2.putText(image_rotated, f"Posture: {posture_status}", (10, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if posture_status == "Good" else (0, 0, 255), 2)

        # Write frame to output video
        out.write(image_rotated)

        # Show video
        cv2.imshow('Posture Tracker', image_rotated)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    else:
        # Add text AFTER rotation to keep it upright
        if hip_angle is not None:
            cv2.putText(image, f"Hip Angle: {hip_angle:.1f}", (10, 90),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
        if neck_angle is not None:
            cv2.putText(image, f"Neck Angle: {neck_angle:.1f}", (10, 130),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
        cv2.putText(image, f"Posture: {posture_status}", (10, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if posture_status == "Good" else (0, 0, 255), 2)

        # Write frame to output video
        out.write(image)

        # Show video
        cv2.imshow('Posture Tracker', image)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# Release resources
cap.release()
out.release()
cv2.destroyAllWindows()
pose.close()

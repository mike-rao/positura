import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Function to calculate angle between two segments
def calculate_angle(p1, p2, p3):
    a = np.array(p1)  # Shoulder
    b = np.array(p2)  # Hip
    c = np.array(p3)  # Knee
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.arccos(cosine_angle) * 180.0 / np.pi
    return angle

# Input and output video paths
input_video_path = 'test_mike2.MOV'  # Replace with your video file
output_video_path = 'output_video.MOV'

# Open the input video
cap = cv2.VideoCapture(input_video_path)
if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

# Get video properties
fps = int(cap.get(cv2.CAP_PROP_FPS))

# Define new frame dimensions (before rotation)
new_width = 720
new_height = 400

# Define the codec and create VideoWriter object
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_video_path, fourcc, fps, (new_height, new_width))  # Swapped width & height for rotation

# Process the video
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Resize the frame before rotation
    frame_resized = cv2.resize(frame, (new_width, new_height))

    # Convert BGR to RGB for MediaPipe
    image = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)
    results = pose.process(image)

    # Convert back to BGR for OpenCV
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    angle = None  # Default to None in case no detection happens

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark

        # Extract keypoints
        left_shoulder = (int(landmarks[11].x * new_width), int(landmarks[11].y * new_height))
        left_hip = (int(landmarks[23].x * new_width), int(landmarks[23].y * new_height))
        left_knee = (int(landmarks[25].x * new_width), int(landmarks[25].y * new_height))

        # Calculate angle at the left hip (shoulder → hip → knee)
        angle = calculate_angle(left_shoulder, left_hip, left_knee)

        # Determine posture status
        if 80 < angle < 100:
            posture_status = "Good"
        elif angle <= 80:
            posture_status = "Slouch"
        else:
            posture_status = "Lean Back"

        # Draw pose landmarks
        mp_drawing.draw_landmarks(
            image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2)
        )

        # Draw visual segments for angle visualization
        cv2.line(image, left_shoulder, left_hip, (255, 255, 0), 3)  # Shoulder to hip
        cv2.line(image, left_hip, left_knee, (255, 255, 0), 3)  # Hip to knee
        cv2.circle(image, left_shoulder, 5, (0, 0, 255), -1)  # Shoulder joint
        cv2.circle(image, left_hip, 5, (0, 255, 0), -1)  # Hip joint
        cv2.circle(image, left_knee, 5, (255, 0, 0), -1)  # Knee joint

    # Rotate the frame 90 degrees clockwise
    image_rotated = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)

    # Add text AFTER rotation to keep it upright
    if angle is not None:
        cv2.putText(image_rotated, f"Angle: {angle:.1f} deg", (10, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)
        cv2.putText(image_rotated, f"Posture: {posture_status}", (10, 90),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if posture_status == "Good" else (0, 0, 255), 2, cv2.LINE_AA)

    # Write the rotated frame to the output video
    out.write(image_rotated)

    # Optional: Display the frame
    cv2.imshow('Posture Tracker', image_rotated)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
out.release()
cv2.destroyAllWindows()
pose.close()

print(f"Output video saved as {output_video_path}")

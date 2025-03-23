import sys
import json
import csv
import time
import os
from datetime import datetime
import threading
import cv2
import mediapipe as mp
import numpy as np

# Set CSV file path relative to backend.py location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE = os.path.join(BASE_DIR, 'sessions.csv')

# Define posture options to ensure fixed order
posture_options = ["Good", "Slouch", "Lean Back", "Bad Posture"]

# Ensure the CSV file exists with headers, including posture types
csv_header = ['id', 'start_time', 'end_time', 'total_duration'] + posture_options
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(csv_header)

current_session = None
posture_log = {}
start_time = None
running = False
posture_thread = None


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

class PostureAnalyzer:
    def __init__(self):
        # Initialize MediaPipe Pose
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.pose = self.mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        self.camera = True  # camera = True
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            print("Error: Could not open video.")
            exit()
        self.fps = 30
        self.new_width, self.new_height = 720, 400

    def analyze_frame(self, frame):
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(image)

        hip_angle, neck_angle = None, None
        posture_status = "Unknown"
        h, w, c = frame.shape
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark

            try:
                # Extract keypoints
                left_shoulder = (int(landmarks[11].x * w), int(landmarks[11].y * h))
                right_shoulder = (int(landmarks[12].x * w), int(landmarks[12].y * h))
                left_hip = (int(landmarks[23].x * w), int(landmarks[23].y * h))
                left_knee = (int(landmarks[25].x * w), int(landmarks[25].y * h))
                nose = (int(landmarks[0].x * w), int(landmarks[0].y * h))

                # Calculate angles
                hip_angle = calculate_angle(left_shoulder, left_hip, left_knee)
                neck_angle = calculate_angle(nose, left_shoulder, left_hip)

                # Determine posture
                if hip_angle is not None and neck_angle is not None:
                    if 85 < hip_angle < 110 and 120 < neck_angle < 150:
                        posture_status = "Good"
                    elif hip_angle <= 85:
                        posture_status = "Slouch"
                    elif hip_angle >= 110:
                        posture_status = "Lean Back"
                    else:
                        posture_status = "Bad Posture"
            except Exception as e:
                print(f"Error processing landmarks: {e}", file=sys.stderr)

        return posture_status

def posture_classification_loop():
    global running, posture_log
    cap = cv2.VideoCapture(0)
    posture_analyzer = PostureAnalyzer()

    while running:
        ret, frame = cap.read()
        if not ret:
            print(json.dumps({'error': 'Frame capture failed'}))
            sys.stdout.flush()
            break

        posture = posture_analyzer.analyze_frame(frame)
        posture = str(posture)
        posture_log[posture] = posture_log.get(posture, 0) + 1

        print(json.dumps({"posture": posture}))
        sys.stdout.flush()
        time.sleep(1)

    cap.release()

def save_session():
    global current_session, start_time, posture_log, running
    if current_session and start_time:
        end_time = datetime.now()
        total_duration = time.time() - start_time

        print(f"Saving session to {CSV_FILE}", file=sys.stderr)

        # Read existing rows to determine the new session ID
        with open(CSV_FILE, 'r', newline='') as f:
            reader = csv.reader(f)
            rows = list(reader)
            session_id = len(rows)  # ID is row count (including header)

        # Prepare posture data for CSV, ensuring consistent order and handling missing counts
        posture_data = [posture_log.get(option, 0) for option in posture_options]

        # Append session data to the CSV file
        with open(CSV_FILE, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(
                [session_id, current_session, end_time.isoformat(), f"{total_duration:.2f}"] + posture_data
            )

        summary = {
            "totalTime": total_duration,
            "postures": posture_log
        }
        print(json.dumps({"summary": summary}))
        sys.stdout.flush()

        print(f"Session saved successfully. ID: {session_id}", file=sys.stderr)

        # Reset session state
        current_session = None
        start_time = None
        posture_log = {}
    else:
        print("No active session to save", file=sys.stderr)

def main():
    global current_session, start_time, posture_log, running, posture_thread

    while True:
        try:
            line = sys.stdin.readline().strip()
            if not line:
                time.sleep(0.1)
                continue

            cmd = json.loads(line)
            print(f"Received command: {cmd}", file=sys.stderr)

            if cmd["command"] == "start":
                if not running:
                    start_time = time.time()
                    current_session = datetime.now().isoformat()
                    posture_log = {}
                    running = True
                    posture_thread = threading.Thread(target=posture_classification_loop)
                    posture_thread.start()
                    print(json.dumps({"message": "Session started"}))
                    sys.stdout.flush()
                else:
                    print(json.dumps({"error": "Session already in progress"}))
                    sys.stdout.flush()

            elif cmd["command"] == "stop":
                if running:
                    running = False
                    if posture_thread:
                        posture_thread.join()
                    save_session()
                else:
                    print(json.dumps({"error": "No active session to stop"}))
                    sys.stdout.flush()

            elif cmd["command"] == "history":
                print(f"Fetching history from {CSV_FILE}", file=sys.stderr)
                with open(CSV_FILE, 'r', newline='') as f:
                    reader = csv.DictReader(f)
                    history = []
                    for row in reader:
                        session = {
                            "id": row["id"],
                            "start_time": row["start_time"],
                            "total_duration": float(row["total_duration"])
                        }
                        # Include posture counts if they exist in the CSV
                        for posture in posture_options:
                            if posture in row:
                                session[posture] = int(row[posture])
                        history.append(session)
                print(json.dumps({"history": history}))
                sys.stdout.flush()

        except json.JSONDecodeError as e:
            print(json.dumps({"error": f"JSON decode error: {str(e)}"}))
            sys.stdout.flush()
        except Exception as e:
            print(json.dumps({"error": f"Unexpected error: {str(e)}"}))
            sys.stdout.flush()

if __name__ == "__main__":
    main()

import sys
import json
import csv
import time
import os
from datetime import datetime
import threading

# Set CSV file path relative to backend.py location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE = os.path.join(BASE_DIR, 'sessions.csv')

# Ensure the CSV file exists with headers
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'start_time', 'end_time', 'total_duration'])

current_session = None
posture_log = {}
start_time = None
running = False
posture_thread = None

def classify_posture():
    """Dummy posture classification logic."""
    return "good"  # Replace with actual posture detection logic

def posture_classification_loop():
    global running, posture_log
    while running:
        posture = classify_posture()
        posture_log[posture] = posture_log.get(posture, 0) + 1
        print(json.dumps({"posture": posture}))
        sys.stdout.flush()
        time.sleep(1)

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

        # Append session data to the CSV file
        with open(CSV_FILE, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                session_id,
                current_session,
                end_time.isoformat(),
                f"{total_duration:.2f}"
            ])

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
                    history = [
                        {
                            "id": row["id"],
                            "start_time": row["start_time"],
                            "total_duration": float(row["total_duration"])
                        }
                        for row in reader
                    ]
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

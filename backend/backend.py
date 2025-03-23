import sys, json, sqlite3, time, cv2
from datetime import datetime

def classify_posture(frame):
    return "good"  # Dummy classification

conn = sqlite3.connect('posture.db')
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS sessions 
             (id INTEGER PRIMARY KEY, start_time TEXT, end_time TEXT, total_duration REAL)''')
c.execute('''CREATE TABLE IF NOT EXISTS posture_logs 
             (session_id INTEGER, posture TEXT, duration REAL)''')
conn.commit()

current_session = None
posture_log = {}
start_time = None
running = False

for line in sys.stdin:
    cmd = json.loads(line)
    
    if cmd["command"] == "start":
        start_time = time.time()
        current_session = datetime.now().isoformat()
        posture_log = {}
        cap = cv2.VideoCapture(0)
        running = True
        while running:
            ret, frame = cap.read()
            if not ret: break
            posture = classify_posture(frame)
            posture_log[posture] = posture_log.get(posture, 0) + 1
            print(json.dumps({"posture": posture}))
            sys.stdout.flush()
            time.sleep(1)
        cap.release()

    elif cmd["command"] == "stop" and current_session:
        running = False  # Stop the loop
        end_time = time.time()
        total_duration = end_time - start_time
        c.execute("INSERT INTO sessions (start_time, end_time, total_duration) VALUES (?, ?, ?)", 
                  (current_session, datetime.now().isoformat(), total_duration))
        session_id = c.lastrowid
        for posture, duration in posture_log.items():
            c.execute("INSERT INTO posture_logs (session_id, posture, duration) VALUES (?, ?, ?)", 
                      (session_id, posture, duration))
        conn.commit()
        summary = {"totalTime": total_duration, "postures": posture_log}
        print(json.dumps({"summary": summary}))
        sys.stdout.flush()

    elif cmd["command"] == "history":
        c.execute("SELECT id, start_time, total_duration FROM sessions")
        history = [{"id": row[0], "start_time": row[1], "total_duration": row[2]} for row in c.fetchall()]
        print(json.dumps({"history": history}))
        sys.stdout.flush()
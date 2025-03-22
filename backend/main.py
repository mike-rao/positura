from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import mediapipe as mp
import torch
import numpy as np

app = FastAPI()

# Enable CORS to allow Next.js frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Placeholder for posture detection (to be expanded with CNN/Roboflow)
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

def detect_posture(frame):
    # Convert the frame to RGB
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(frame_rgb)
    
    if results.pose_landmarks:
        # Simple heuristic for posture (expand with CNN later)
        landmarks = results.pose_landmarks.landmark
        shoulder_y = (landmarks[11].y + landmarks[12].y) / 2  # Average of shoulders
        hip_y = (landmarks[23].y + landmarks[24].y) / 2       # Average of hips
        
        if shoulder_y < hip_y - 0.1:
            return "good posture"
        elif shoulder_y > hip_y + 0.1:
            return "slouched back"
        else:
            return "hunched over"
    return "unknown"

@app.get("/")
async def root():
    return {"message": "Posture App Backend"}

@app.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    # Read uploaded video file (for testing; replace with live feed later)
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    posture = detect_posture(frame)
    return {"posture": posture}

# Placeholder for live feed endpoint (to be implemented)
@app.get("/live-feed")
async def live_feed():
    return {"message": "Live feed processing not yet implemented"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
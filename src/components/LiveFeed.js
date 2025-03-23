import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIpcRenderer } from '../utils/ipc';
import '../styles/LiveFeed.css';

function LiveFeed() {
  const [posture, setPosture] = useState('Unknown'); // Default to "Unknown"
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const navigate = useNavigate();
  
  const lastNotificationTime = useRef({ Slouch: 0, "Lean Back": 0 });

  const postureImages = {
    "Good": "/assets/good_posture.png",
    "Slouch": "/assets/slouch.png",
    "Lean Back": "/assets/lean_back.png",
    "Bad Posture": "/assets/bad_posture.png",
    "Unknown": "/assets/good_posture.png" // Default image
  };

  useEffect(() => {
    console.log('LiveFeed mounted');
    if (window.electronAPI) {
      console.log('Sending start-session');
      window.electronAPI.startSession();

      const messageHandler = (event, message) => {
        console.log('Received python-message:', message);
        if (message.posture) {
          setPosture(message.posture);
          sendPostureNotification(message.posture);
        }
      };

      window.electronAPI.onPythonMessage(messageHandler);

      return () => {
        console.log('LiveFeed unmounting');
        window.electronAPI.removeAllListeners('python-message');
      };
    } else {
      console.error('electronAPI not available');
    }
  }, []);

  const sendPostureNotification = (newPosture) => {
    const currentTime = Date.now();
    if (newPosture === "Slouch" || newPosture === "Lean Back") {
      const lastTime = lastNotificationTime.current[newPosture] || 0;
      if (currentTime - lastTime >= 60000) { // 60 seconds (1 minute)
        new Notification("Posture Alert", {
          body: newPosture === "Slouch" 
            ? "You're slouching! Sit up straight to maintain good posture." 
            : "You're leaning back too much! Keep a balanced posture.",
          icon: postureImages[newPosture]
        });
        lastNotificationTime.current[newPosture] = currentTime;
      }
    }
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const togglePause = () => {
    setIsRunning((prev) => !prev);
  };

  const stopSession = () => {
    setIsRunning(false);
    if (window.electronAPI) {
      console.log('Sending stop-session');
      window.electronAPI.stopSession();
      navigate('/summary', { state: { totalTime: timer } });
    } else {
      console.error('electronAPI not available');
      navigate('/summary', { state: { totalTime: timer } });
    }
  };

  const handleMinimize = () => {
    console.log('Minimize clicked');
    if (window.electronAPI && window.electronAPI.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    } else {
      console.error('electronAPI or minimizeWindow not available');
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <div className="live-feed">
      {/* Window Controls */}
      <div className="window-controls">
        <img id="minimize-btn" src="/assets/minimize.png" alt="Minimize" onClick={handleMinimize} />
        <img id="close-btn" src="/assets/exit.png" alt="Close" onClick={handleClose} />
      </div>

      {/* Live Feed Box */}
      <div className="live-feed-box">
        <div className="live-header">
          <h2 className="pixelify-sans">Live Feed</h2>
          <div className="live-dot"></div>
        </div>
        <img
          src={postureImages[posture] || postureImages["Unknown"]} // Fallback to "Unknown"
          alt={posture}
          className="posture-image"
        />
      </div>

      {/* Video and Posture */}
      <video autoPlay muted style={{ width: '50%' }} />
      <div className="status-container">
        <p className="pixelify-sans timer">Timer: {Math.floor(timer / 60)}m {timer % 60}s</p>
        <p className="pixelify-sans posture">Posture: {posture}</p>
      </div>

      {/* Control Buttons */}
      <div className="control-buttons">
        <img
          src={isRunning ? "/assets/continue.png" : "/assets/paused.png"}
          alt={isRunning ? "Continue" : "Pause"}
          onClick={togglePause}
          className="control-btn animated-btn"
          style={{ width: '65px', height: '65px' }}
        />
        <img
          src="/assets/stop.png"
          alt="Stop"
          onClick={stopSession}
          className="control-btn animated-btn"
          style={{ width: '65px', height: '65px' }}
        />
      </div>
    </div>
  );
}

export default LiveFeed;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIpcRenderer } from '../utils/ipc';
import '../styles/LiveFeed.css';

function PomodoroLiveFeed() {
  const [posture, setPosture] = useState('Unknown');
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60); // 25 min study timer
  const [sessionTimer, setSessionTimer] = useState(0); // Running stopwatch
  const [mode, setMode] = useState('Study'); // 'Study' or 'Break'
  const [isRunning, setIsRunning] = useState(true);
  const navigate = useNavigate();

  const lastNotificationTime = useRef({ Slouch: 0, "Lean Back": 0 });

  const postureImages = {
    "Good": "/assets/good_posture.png",
    "Slouch": "/assets/slouch.png",
    "Lean Back": "/assets/lean_back.png",
    "Bad Posture": "/assets/bad_posture.png",
    "Unknown": "/assets/good_posture.png"
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

  useEffect(() => {
    let pomodoroInterval;
    let sessionInterval;

    if (isRunning) {
      // Pomodoro countdown
      if (pomodoroTimeLeft > 0) {
        pomodoroInterval = setInterval(() => {
          setPomodoroTimeLeft((prev) => prev - 1);
        }, 1000);
      } else {
        switchMode();
      }

      // Running stopwatch
      sessionInterval = setInterval(() => {
        setSessionTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      clearInterval(pomodoroInterval);
      clearInterval(sessionInterval);
    };
  }, [isRunning, pomodoroTimeLeft]);

  const switchMode = () => {
    const nextMode = mode === 'Study' ? 'Break' : 'Study';
    const nextTime = nextMode === 'Study' ? 25 * 60 : 5 * 60;

    setMode(nextMode);
    setPomodoroTimeLeft(nextTime);

    new Notification("Pomodoro Timer", {
      body: nextMode === 'Study' ? "Time to study! Focus up!" : "Break time! Relax for 5 minutes.",
      icon: nextMode === 'Study' ? "/assets/study.png" : "/assets/break.png"
    });
  };

  const sendPostureNotification = (newPosture) => {
    const currentTime = Date.now();
    if (newPosture === "Slouch" || newPosture === "Lean Back") {
      const lastTime = lastNotificationTime.current[newPosture] || 0;
      if (currentTime - lastTime >= 60000) {
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

  const togglePause = () => {
    setIsRunning((prev) => !prev);
  };

  const stopSession = () => {
    setIsRunning(false);
    if (window.electronAPI) {
      console.log('Sending stop-session');
      window.electronAPI.stopSession();
      navigate('/summary', { state: { totalTime: sessionTimer } });
    } else {
      console.error('electronAPI not available');
      navigate('/summary', { state: { totalTime: sessionTimer } });
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="live-feed">
      {/* Window Controls */}
      <div className="lf-window-controls">
        <img id="lf-minimize-btn" src="/assets/minimize.png" alt="Minimize" onClick={handleMinimize} />
        <img id="lf-close-btn" src="/assets/exit.png" alt="Close" onClick={handleClose} />
      </div>

      {/* Live Feed Box */}
      <div className="live-feed-box">
        <div className="live-header">
          <h2 className="pixelify-sans">Pomodoro Timer</h2>
          <div className="live-dot"></div>
        </div>
        <img
          src={postureImages[posture] || postureImages["Unknown"]}
          alt={posture}
          className="posture-image"
        />
      </div>

      {/* Video and Posture */}
      <video autoPlay muted style={{ width: '50%' }} />
      <div className="status-container">
        <p className="pixelify-sans timer">{mode}: {formatTime(pomodoroTimeLeft)}</p>
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

export default PomodoroLiveFeed;

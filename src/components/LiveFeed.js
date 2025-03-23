import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIpcRenderer } from '../utils/ipc';
import '../styles/LiveFeed.css'; // Adjust path if needed

function LiveFeed() {
  const [posture, setPosture] = useState('N/A');
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true); // Start as running by default
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    
    getIpcRenderer()
      .then((ipcRenderer) => {
        ipcRenderer.send('start-session');

        // Listen for posture updates from Python
        ipcRenderer.on('python-message', (event, message) => {
          if (message.posture) setPosture(message.posture);
        });
      })
      .catch((err) => console.error('Failed to get ipcRenderer:', err));

    return () => {
      getIpcRenderer()
        .then((ipcRenderer) => {
          ipcRenderer.removeAllListeners('python-message');
        })
        .catch((err) => console.error('Cleanup failed:', err));
    };
  }, []); // Runs only on mount/unmount

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]); // Runs every time `isRunning` changes

  const togglePause = () => {
    setIsRunning((prev) => !prev);
  };

  const stopSession = () => {
    setIsRunning(false);
    getIpcRenderer()
      .then((ipcRenderer) => {
        ipcRenderer.send('stop-session');
        navigate('/summary', { state: { totalTime: timer } });
      })
      .catch((err) => console.error('Failed to stop session:', err));
      navigate('/summary', { state: { totalTime: timer } }); // fallback
  };

  return (
    <div className="live-feed">
      {/* Window Controls */}
      <div className="window-controls">
        <img id="minimize-btn" src="/assets/minimize.png" alt="Minimize" />
        <img id="close-btn" src="/assets/exit.png" alt="Close" />
      </div>

      <h2>Live Feed</h2>
      <video autoPlay muted style={{ width: '50%' }} /> {/* Placeholder */}
      <p>Timer: {Math.floor(timer / 60)}m {timer % 60}s</p>
      <p>Posture: {posture}</p>
      <button onClick={togglePause}>
        {isRunning ? 'Pause' : 'Continue'}
      </button>
      <button onClick={stopSession}>Stop</button>
    </div>
  );
}

export default LiveFeed;

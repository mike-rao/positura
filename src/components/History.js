import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIpcRenderer } from '../utils/ipc';
import '../styles/History.css';

function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('History component mounted');
    if (window.electronAPI) {
      console.log('Sending get-history');
      window.electronAPI.getHistory();
  
      const messageHandler = (event, message) => {
        console.log('Received python-message:', message);
        if (message.history) {
          setHistory(message.history);
        }
      };
  
      window.electronAPI.onPythonMessage(messageHandler);
  
      return () => {
        window.electronAPI.removeAllListeners('python-message');
      };
    } else {
      console.error('electronAPI not available');
    }
  }, []);

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
    <div className="history">
      {/* Window Controls */}
      <div className="window-controls">
        <img id="minimize-btn" src="/assets/minimize.png" alt="Minimize" onClick={handleMinimize} />
        <img id="close-btn" src="/assets/exit.png" alt="Close" onClick={handleClose} />
      </div>
      <h2 className="pixelify-sans">Session History</h2>
      {history.length === 0 ? (
        <p className="pixelify-sans">No sessions recorded yet.</p>
      ) : (
        <div className="history-list">
          <ul>
            {history.map((session) => (
              <li key={session.id} className="pixelify-sans">
                {new Date(session.start_time).toLocaleString()} -{' '}
                {Math.floor(session.total_duration / 60)}m {Math.round(session.total_duration % 60)}s
              </li>
            ))}
          </ul>
        </div>
      )}
      <img
        src="/assets/finish.png"
        alt="Back to Home"
        className="finish-button pixelify-sans"
        onClick={() => navigate('/')}
      />
    </div>
  );
}

export default History;

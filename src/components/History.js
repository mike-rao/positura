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

  const handleSessionClick = (session) => {
    navigate('/history-summary', { state: { session } });
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

  const handleHome = () => {
    navigate('/');
  }

  return (
    <div className="history">
      {/* Window Controls */}
      <div className="window-controls">
        <img id="home-btn" src="/assets/home.png" alt="Home" onClick={handleHome} />
        <div className="right-controls"> {/* Container for right-aligned buttons */}
          <img id="minimize-btn" src="/assets/minimize.png" alt="Minimize" onClick={handleMinimize} />
          <img id="close-btn" src="/assets/exit.png" alt="Close" onClick={handleClose} />
        </div>
      </div>

      <h2 className="pixelify-sans-big session-history">Session History</h2>
      {history.length === 0 ? (
        <p className="pixelify-sans no-sessions">No sessions recorded yet.</p>
      ) : (
        <div className="history-list">
          <ul>
            {history.map((session) => (
              <li 
                key={session.id} 
                className="pixelify-sans-small"
                onClick={() => handleSessionClick(session)}
                style={{ cursor: 'pointer' }}
              >
                {new Date(session.start_time).toLocaleString()} -{' '}
                {Math.floor(session.total_duration / 60)}m {Math.round(session.total_duration % 60)}s
              </li>
            ))}
          </ul>
        </div>
      )}
      <img
        src="/assets/finish.png"
        alt="finish"
        className="finish-button pixelify-sans"
        onClick={() => navigate('/')}
      />
    </div>
  );
}

export default History;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getIpcRenderer } from '../utils/ipc';
import '../styles/Summary.css';
ChartJS.register(ArcElement, Tooltip, Legend);

function Summary() {
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Get state from navigation
  const totalTime = location.state?.totalTime || 0; // Fallback to 0 if not provided

  useEffect(() => {
    getIpcRenderer()
      .then((ipcRenderer) => {
        ipcRenderer.on('python-message', (event, message) => {
          console.log('Received python-message:', message);
          if (message.summary) setSummary(message.summary);
        });
      })
      .catch((err) => console.error('Failed to get ipcRenderer:', err));

    return () => {
      getIpcRenderer().then((ipcRenderer) => {
        ipcRenderer.removeAllListeners('python-message');
      });
    };
  }, []);

  const data = summary
    ? {
        labels: Object.keys(summary.postures),
        datasets: [
          {
            data: Object.values(summary.postures),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
          },
        ],
      }
    : {};

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
    <div className="summary">
      {/* Window Controls */}
      <div className="window-controls">
        <img id="minimize-btn" src="/assets/minimize.png" alt="Minimize" onClick={handleMinimize}/>
        <img id="close-btn" src="/assets/exit.png" alt="Close" onClick={handleClose} />
      </div>

      <h2 className="pixelify-sans" >Session Summary</h2>
      <p className="pixelify-sans" >Total Time: {Math.floor(totalTime / 60)}m {totalTime % 60}s</p>
      {summary ? (
        <>
          <Pie data={data} />
        </>
      ) : (
        <p className="pixelify-sans" >Loading posture summary...</p>
      )}
      <button  className="pixelify-sans" onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}

export default Summary;
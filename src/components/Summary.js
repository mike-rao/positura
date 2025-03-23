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
  const session = location.state?.session;

  useEffect(() => {
    console.log('Summary component mounted');
    if (window.electronAPI) {
      // Request the summary data from backend.py
      window.electronAPI.getSummary();

      const messageHandler = (event, message) => {
        console.log('Received python-message:', message);
        if (message.summary) {
          setSummary(message.summary);
        }
      };

      window.electronAPI.onPythonMessage(messageHandler);

      // Clean up the listener when the component unmounts
      return () => {
        window.electronAPI.removeAllListeners('python-message');
      };
    } else {
      console.error('electronAPI not available');
    }
  }, []);

  const data = summary
    ? {
        labels: Object.keys(summary.postures),
        datasets: [
          {
            data: Object.values(summary.postures),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
          },
        ],
      }
    : {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: [],
          },
        ],
      };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'left',
        align: 'start',
        labels: {
          font: {
            family: 'Pixelify Sans', // Use your desired font family
            size: 16, // Adjust the font size as needed
          },
          color: '#555483', // Adjust the color as needed
        },
      },
      title: {
        display: true,
        text: 'Posture Distribution',
        font: {
          family: 'Pixelify Sans', // Use your desired font family
          size: 18, // Adjust the font size as needed
          color: '#555483'
        }
      },
    },
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

  const handleBack = () => {
    navigate('/history');
  }

  const handleFinish = () => {
    navigate('/');
  }

  const handleHome = () => {
    navigate('/');
  }

  return (
    <div className="summary">
      {/* Window Controls */}
      <div className="window-controls">
        <img id="home-btn" src="/assets/home.png" alt="Home" onClick={handleHome} />
        <div className="right-controls"> {/* Container for right-aligned buttons */}
          <img id="minimize-btn" src="/assets/minimize.png" alt="Minimize" onClick={handleMinimize} />
          <img id="close-btn" src="/assets/exit.png" alt="Close" onClick={handleClose} />
        </div>
      </div>

      <h2 className="pixelify-sans-big session-summary">Session Summary</h2>
      <p className="pixelify-sans total-time">Total Time: {Math.floor(totalTime / 60)}m {Math.round(totalTime % 60)}s</p>

      <div className="chart-container">
        {summary ? (
          <Pie data={data} options={options} />
        ) : (
          <p className="pixelify-sans loading-p-s">Loading posture summary...</p>
        )}
      </div>

      <img 
          src="/assets/finish.png" 
          alt="finish" 
          className="finish-button pixelify-sans" 
          onClick={handleFinish} 
        />
    </div>
  );
}

export default Summary;

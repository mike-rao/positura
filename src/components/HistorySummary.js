import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getIpcRenderer } from '../utils/ipc';
import '../styles/Summary.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function HistorySummary() {
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Get state from navigation
  const session = location.state?.session; // Retrieve the session data

  const totalTime = session ? session.total_duration : 0; // Get total time from session data

  useEffect(() => {
    console.log('Summary component mounted');
    if (window.electronAPI && session) {
      // If session data is available, construct the chart data directly
      const chartData = {
        labels: ['Good', 'Slouch', 'Lean Back', 'Bad Posture'],
        datasets: [
          {
            data: [session.Good || 0, session.Slouch || 0, session['Lean Back'] || 0, session['Bad Posture'] || 0],
            backgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384', '#36A2EB'],
            hoverBackgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384', '#36A2EB'],
          },
        ],
      };

      setSummary({ postures: chartData }); // Set the constructed chart data
    } else {
      console.error('electronAPI not available or no session data');
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('python-message');
      }
    };
  }, [session]);  // Depend on the session data


  const data = summary
    ? {
      labels: summary.postures.labels,
      datasets: summary.postures.datasets
    }
    : {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        hoverBackgroundColor: [],
      }]
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
        {summary && summary.postures.datasets[0].data.length > 0 ? (
          <Pie data={data} options={options} />
        ) : (
          <p className="pixelify-sans loading-p-s">Loading posture summary...</p>
        )}
      </div>

      <img 
        src="/assets/back.png" 
        alt="back" 
        className="finish-button pixelify-sans" 
        onClick={handleBack} 
      />
    </div>
  );
}

export default HistorySummary;

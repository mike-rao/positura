import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getIpcRenderer } from '../utils/ipc';
ChartJS.register(ArcElement, Tooltip, Legend);

function Summary() {
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getIpcRenderer().then((ipcRenderer) => {
      ipcRenderer.on('python-message', (event, message) => {
        if (message.summary) setSummary(message.summary);
      });
    }).catch((err) => console.error('Failed to get ipcRenderer:', err));

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

  return (
    <div>
      <h2>Session Summary</h2>
      {summary ? (
        <>
          <p>Total Time: {summary.totalTime}s</p>
          <Pie data={data} />
        </>
      ) : (
        <p>Loading summary...</p>
      )}
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}

export default Summary;
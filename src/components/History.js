import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIpcRenderer } from '../utils/ipc';

function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getIpcRenderer().then((ipcRenderer) => {
      ipcRenderer.send('get-history');
      ipcRenderer.on('python-message', (event, message) => {
        if (message.history) setHistory(message.history);
      });
    }).catch((err) => console.error('Failed to get ipcRenderer:', err));

    return () => {
      getIpcRenderer().then((ipcRenderer) => {
        ipcRenderer.removeAllListeners('python-message');
      });
    };
  }, []);

  return (
    <div>
      <h2>Session History</h2>
      <ul>
        {history.map((session) => (
          <li key={session.id}>
            {session.start_time} - {session.total_duration}s
          </li>
        ))}
      </ul>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}

export default History;
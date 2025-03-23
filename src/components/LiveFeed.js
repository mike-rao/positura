import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIpcRenderer } from '../utils/ipc';

function LiveFeed() {
  const [posture, setPosture] = useState('N/A');
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    getIpcRenderer().then((ipcRenderer) => {
      ipcRenderer.send('start-session');
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);

      ipcRenderer.on('python-message', (event, message) => {
        if (message.posture) setPosture(message.posture);
      });
    }).catch((err) => console.error('Failed to get ipcRenderer:', err));

    return () => {
      if (interval) clearInterval(interval);
      getIpcRenderer().then((ipcRenderer) => {
        ipcRenderer.removeAllListeners('python-message');
      });
    };
  }, []);

  const stopSession = () => {
    getIpcRenderer().then((ipcRenderer) => {
      console.log('Sending stop-session');
      ipcRenderer.send('stop-session');
    }).catch((err) => console.error('Failed to stop session:', err));
    navigate('/summary'); // Move outside Promise to ensure it runs
  };

  return (
    <div>
      <h2>Live Feed</h2>
      <video autoPlay muted style={{ width: '50%' }} /> {/* Placeholder */}
      <p>Timer: {timer}s</p>
      <p>Posture: {posture}</p>
      <button onClick={() => {}}>Pause</button>
      <button onClick={stopSession}>Stop</button>
    </div>
  );
}

export default LiveFeed;
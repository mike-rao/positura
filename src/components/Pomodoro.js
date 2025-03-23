import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Pomodoro.css';

function LiveFeed() {
  const navigate = useNavigate();

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
    <div className="live-feed">
      {/* Window Controls */}
      <div className="window-controls">
        <img id="minimize-btn" src="/assets/minimize.png" alt="Minimize" onClick={handleMinimize}/>
        <img id="close-btn" src="/assets/exit.png" alt="Close" onClick={handleClose} />
      </div>
      {/* <h2 className="pixelify-sans">Live Feed</h2> */}
      <div className="text-container">
  <p className="pixelify-sans move-paragraph">
    The Pomodoro Technique is a time management method which breaks up study time into 25 minutes with short breaks, aiming to increase productivity! Press the start button to begin your pomodoro timer!
  </p>
</div>

<div className="button-container">
  <div className="study-button-container">
    <img
      id="study-btn"
      className="nav-btn"
      src="/assets/start1.png"
      alt="Study"
      onClick={() => navigate('/live-feed')}
    />
  </div>
</div>


    </div>
  );
}

export default LiveFeed;


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getIpcRenderer } from '../utils/ipc';

// function Pomodoro() {
//   const [posture, setPosture] = useState('N/A');
//   const [timer, setTimer] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     let interval;
//     getIpcRenderer().then((ipcRenderer) => {
//       ipcRenderer.send('start-session');
//       interval = setInterval(() => setTimer((prev) => prev + 1), 1000);

//       ipcRenderer.on('python-message', (event, message) => {
//         if (message.posture) setPosture(message.posture);
//       });
//     }).catch((err) => console.error('Failed to get ipcRenderer:', err));

//     return () => {
//       if (interval) clearInterval(interval);
//       getIpcRenderer().then((ipcRenderer) => {
//         ipcRenderer.removeAllListeners('python-message');
//       });
//     };
//   }, []);

//   const stopSession = () => {
//     getIpcRenderer().then((ipcRenderer) => {
//       console.log('Sending stop-session');
//       ipcRenderer.send('stop-session');
//     }).catch((err) => console.error('Failed to stop session:', err));
//     navigate('/summary'); // Move outside Promise to ensure it runs
//   };

//   const handleMinimize = () => {
//     console.log('Minimize clicked');
//     if (window.electronAPI && window.electronAPI.minimizeWindow) {
//       window.electronAPI.minimizeWindow();
//     } else {
//       console.error('electronAPI or minimizeWindow not available');
//     }
//   };

//   const handleClose = () => {
//     if (window.electronAPI) {
//       window.electronAPI.closeWindow();
//     }
//   };

//   return (
// <div>
//   {/* Window Controls */}
//   <div className="window-controls">
//     <img id="minimize-btn" src="/assets/minimize.png" alt="Minimize" onClick={handleMinimize} />
//     <img id="close-btn" src="/assets/exit.png" alt="Close" onClick={handleClose} />
//   </div>

//   <p className="pixelify-sans move-paragraph">
//     The Pomodoro Technique is a time management method which breaks up study time into 25 minutes with short breaks, aiming to increase productivity! Press the start button to begin your pomodoro timer!
//   </p>

//   <video autoPlay muted style={{ width: '50%' }} /> {/* Placeholder */}

//   {/* Study Button */}
//   <div className="study-button-container">
//     <img
//       id="study-btn"
//       className="nav-btn"
//       src="/assets/start1.png"
//       alt="Study"
//       onClick={() => navigate('/live-feed')}
//     />
//   </div>
// </div>

//   );
// }

// export default Pomodoro;
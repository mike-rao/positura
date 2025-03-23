import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Pomodoro.css';

function Pomodoro() {
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
    The Pomodoro Technique breaks up study time into 25 min with short breaks to increase productivity!
  </p>
  <p className="pixelify-sans press-start">Press the start button to begin your pomodoro timer!</p>
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

export default Pomodoro;
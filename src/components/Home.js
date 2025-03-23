import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'; // Importing the CSS

function Home() {
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

  const handleHome = () => {
    navigate('/');
  }

  return (
    <div>
      {/* Window Controls */}
      <div className="window-controls">
        <img id="home-btn" src="/assets/home.png" alt="Home" onClick={handleHome} />
        <div className="right-controls"> {/* Container for right-aligned buttons */}
          <img id="minimize-btn" src="/assets/minimize.png" alt="Minimize" onClick={handleMinimize} />
          <img id="close-btn" src="/assets/exit.png" alt="Close" onClick={handleClose} />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="button-container">
        <img 
          id="pomodoro-btn" 
          className="nav-btn" 
          src="/assets/pomo1.png" 
          alt="Pomodoro" 
          onClick={() => navigate('/pomodoro')} 
        />
        <img 
          id="history-btn" 
          className="nav-btn" 
          src="/assets/history1.png" 
          alt="History" 
          onClick={() => navigate('/history')} 
        />
      </div>

      {/* Study Button */}
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
  );
}

export default Home;

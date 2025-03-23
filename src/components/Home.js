import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css'; // Importing the CSS

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Window Controls */}
      <div className="window-controls">
        <img id="minimize-btn" src="/assets/minimize.png" alt="Minimize" />
        <img id="close-btn" src="/assets/exit.png" alt="Close" />
      </div>

      {/* Navigation Buttons */}
      <div className="button-container">
        <img 
          id="history-btn" 
          className="nav-btn" 
          src="/assets/history1.png" 
          alt="History" 
          onClick={() => navigate('/history')} 
        />
        <img 
          id="pomodoro-btn" 
          className="nav-btn" 
          src="/assets/pomo1.png" 
          alt="Pomodoro" 
          onClick={() => navigate('/pomodoro')} 
        />
      </div>

      {/* Study Button */}
      <div className="study-button-container">
        <img 
          id="study-btn" 
          className="nav-btn" 
          src="/assets/start1.png" 
          alt="Study" 
          onClick={() => navigate('/study')} 
        />
      </div>
    </div>
  );
}

export default Home;

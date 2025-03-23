import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Posture App</h1>
      <button onClick={() => navigate('/live-feed')}>Study</button>
      <button onClick={() => navigate('/history')}>History</button>
    </div>
  );
}

export default Home;
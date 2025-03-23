import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import LiveFeed from './components/LiveFeed';
import Summary from './components/Summary';
import History from './components/History';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live-feed" element={<LiveFeed />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  );
}

export default App;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import LiveFeed from './components/LiveFeed';
import Pomodoro from './components/Pomodoro';
import PomodoroLiveFeed from './components/PomodoroLiveFeed';
import Summary from './components/Summary';
import History from './components/History';
import HistorySummary from './components/HistorySummary';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live-feed" element={<LiveFeed />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/pomodoro-live-feed" element={<PomodoroLiveFeed />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/history" element={<History />} />
        <Route path="/history-summary" element={<HistorySummary />} />
      </Routes>
    </div>
  );
}

export default App;
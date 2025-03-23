import React from 'react';
import { createRoot } from 'react-dom/client'; // Updated import
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css';

const container = document.getElementById('root');
const root = createRoot(container); // Create a root
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
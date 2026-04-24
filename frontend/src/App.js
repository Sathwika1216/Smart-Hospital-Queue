import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Queue from './pages/Queue';
import Doctor from './pages/Doctor';
import Status from './pages/Status';
import './App.css';

/**
 * Application shell: global chrome + routed pages for each workflow.
 */
function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <span>API base URL: {process.env.REACT_APP_API_URL || 'http://localhost:3999'}</span>
      </footer>
    </div>
  );
}

export default App;

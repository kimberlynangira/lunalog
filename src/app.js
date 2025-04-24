// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CalendarView from './components/CalendarView';
import HealthInsightsPage from './components/HealthInsightsPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
// ... other component imports (e.g., Dashboard)

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/calendar">Calendar</Link>
            </li>
            <li>
              <Link to="/health-insights">Health Insights</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            {/* Add links for other pages as you create them */}
          </ul>
        </nav>

        <Routes>
          <Route path="/dashboard" element={<>Dashboard Component</>} /> {/* Replace with your actual Dashboard component */}
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/health-insights" element={<HealthInsightsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Add routes for other pages here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
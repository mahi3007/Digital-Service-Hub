import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="grid grid-cols-4">
        <div className="card">
          <h3>Navigation</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/dashboard">Overview</Link></li>
            <li><Link to="/dashboard/bookings">My Bookings</Link></li>
            <li><Link to="/dashboard/rfqs">My RFQs</Link></li>
            <li><Link to="/dashboard/profile">Profile</Link></li>
          </ul>
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/bookings" element={<div>Bookings List</div>} />
            <Route path="/rfqs" element={<div>RFQs List</div>} />
            <Route path="/profile" element={<div>Profile Settings</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const DashboardOverview = () => (
  <div>
    <h1>Dashboard Overview</h1>
    <div className="grid grid-cols-3">
      <div className="card">
        <h3>Total Bookings</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
      </div>
      <div className="card">
        <h3>Active RFQs</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
      </div>
      <div className="card">
        <h3>Total Spent</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹0</p>
      </div>
    </div>
  </div>
);

export default Dashboard;

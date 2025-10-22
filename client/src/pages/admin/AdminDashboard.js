import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Admin Dashboard</h1>
      <div className="grid grid-cols-4">
        <div className="card">
          <h3>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
        </div>
        <div className="card">
          <h3>Total Vendors</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
        </div>
        <div className="card">
          <h3>Total Bookings</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
        </div>
        <div className="card">
          <h3>Revenue</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹0</p>
        </div>
      </div>
      <p style={{ marginTop: '2rem' }}>Admin dashboard with user management, vendor verification, and analytics</p>
    </div>
  );
};

export default AdminDashboard;

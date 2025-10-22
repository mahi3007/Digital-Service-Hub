import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './store/slices/authSlice';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Services from './pages/services/Services';
import ServiceDetail from './pages/services/ServiceDetail';
import Vendors from './pages/vendors/Vendors';
import VendorDetail from './pages/vendors/VendorDetail';
import BookingFlow from './pages/booking/BookingFlow';
import CreateRFQ from './pages/rfq/CreateRFQ';
import RFQList from './pages/rfq/RFQList';
import RFQDetail from './pages/rfq/RFQDetail';
import Dashboard from './pages/dashboard/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main style={{ minHeight: '80vh' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/vendors/:id" element={<VendorDetail />} />

            {/* Protected Routes */}
            <Route
              path="/booking/:serviceId"
              element={
                <ProtectedRoute>
                  <BookingFlow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rfq/create"
              element={
                <ProtectedRoute>
                  <CreateRFQ />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rfq"
              element={
                <ProtectedRoute>
                  <RFQList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rfq/:id"
              element={
                <ProtectedRoute>
                  <RFQDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

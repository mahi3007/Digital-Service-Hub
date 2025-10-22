import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServices } from '../../store/slices/serviceSlice';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';

const Services = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { services, loading } = useSelector((state) => state.service);
  const [filters, setFilters] = useState({
    serviceType: searchParams.get('type') || '',
    category: '',
    search: '',
  });

  useEffect(() => {
    dispatch(fetchServices(filters));
  }, [dispatch, filters]);

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Browse Services</h1>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="grid grid-cols-3">
          <div className="form-group">
            <label>Service Type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
            >
              <option value="">All Services</option>
              <option value="LVHF">Home Services</option>
              <option value="HVLF">Event Services</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="cleaning">Cleaning</option>
              <option value="catering">Catering</option>
              <option value="photography">Photography</option>
            </select>
          </div>
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search services..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-3">
        {services.map((service) => (
          <Link to={`/services/${service._id}`} key={service._id} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', cursor: 'pointer', transition: 'transform 0.2s' }}>
              {service.images?.[0] && (
                <img
                  src={service.images[0].url}
                  alt={service.name}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }}
                />
              )}
              <h3 style={{ marginBottom: '0.5rem' }}>{service.name}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {service.description.substring(0, 100)}...
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  <span style={{ fontWeight: 600 }}>{service.rating?.average?.toFixed(1) || 'New'}</span>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    ({service.rating?.count || 0})
                  </span>
                </div>
                <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                  ₹{service.basePrice}
                </div>
              </div>
              <span className={`badge ${service.serviceType === 'LVHF' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '0.5rem' }}>
                {service.serviceType === 'LVHF' ? 'Instant Booking' : 'Request Quote'}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center" style={{ padding: '3rem 0' }}>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>No services found</p>
        </div>
      )}
    </div>
  );
};

export default Services;

import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServiceById } from '../../store/slices/serviceSlice';

const ServiceDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { service, loading } = useSelector((state) => state.service);

  useEffect(() => {
    dispatch(fetchServiceById(id));
  }, [dispatch, id]);

  if (loading) return <div className="loading-spinner"></div>;
  if (!service) return <div>Service not found</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="grid grid-cols-2">
        <div>
          <h1>{service.name}</h1>
          <p style={{ color: '#6b7280', margin: '1rem 0' }}>{service.description}</p>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>Features</h3>
            <ul>
              {service.features?.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Pricing</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              ₹{service.basePrice}
            </p>
            <p style={{ color: '#6b7280' }}>{service.pricingType}</p>
          </div>
        </div>

        <div className="card">
          <h3>Book This Service</h3>
          {service.bookingType === 'instant' ? (
            <Link to={`/booking/${service._id}`} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Book Now
            </Link>
          ) : (
            <Link to="/rfq/create" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Request Quote
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;

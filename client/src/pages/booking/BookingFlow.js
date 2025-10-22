import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createBooking } from '../../store/slices/bookingSlice';
import toast from 'react-hot-toast';

const BookingFlow = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    location: {
      address: { street: '', city: '', zipCode: '' },
      instructions: '',
    },
    customerNotes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createBooking({ serviceId, ...formData })).unwrap();
      toast.success('Booking created successfully!');
      navigate('/dashboard/bookings');
    } catch (error) {
      toast.error(error || 'Failed to create booking');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Book Service</h1>
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Scheduled Date</label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Scheduled Time</label>
            <input
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              value={formData.location.address.street}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, address: { ...formData.location.address, street: e.target.value } },
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={formData.customerNotes}
              onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
              rows="4"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingFlow;

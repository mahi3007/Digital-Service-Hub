import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createRFQ } from '../../store/slices/rfqSlice';
import toast from 'react-hot-toast';

const CreateRFQ = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    eventType: 'wedding',
    budget: { min: '', max: '' },
    eventDate: '',
    guestCount: '',
    location: { venue: '', address: { city: '', state: '' } },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createRFQ(formData)).unwrap();
      toast.success('RFQ created successfully!');
      navigate('/rfq');
    } catch (error) {
      toast.error(error || 'Failed to create RFQ');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>Create Request for Quotation</h1>
      <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., Wedding Reception"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows="5"
              placeholder="Describe your event requirements in detail..."
            />
          </div>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label>Event Type</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="corporate">Corporate Event</option>
                <option value="party">Party</option>
              </select>
            </div>
            <div className="form-group">
              <label>Event Date</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label>Budget Min (₹)</label>
              <input
                type="number"
                value={formData.budget.min}
                onChange={(e) =>
                  setFormData({ ...formData, budget: { ...formData.budget, min: e.target.value } })
                }
              />
            </div>
            <div className="form-group">
              <label>Budget Max (₹)</label>
              <input
                type="number"
                value={formData.budget.max}
                onChange={(e) =>
                  setFormData({ ...formData, budget: { ...formData.budget, max: e.target.value } })
                }
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Submit RFQ
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRFQ;

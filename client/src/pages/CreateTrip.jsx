import React, { useState } from 'react';
import axios from '../services/api'; // use your existing Axios instance
import { useAuth } from '../hooks/useAuth';

const CreateTrip = () => {
  const { token, user } = useAuth(); // get logged-in user info
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    startDate: '',
    endDate: '',
    description: '',
    capacity: '',
    registrationDeadline: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        '/events/trips',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage('Trip created successfully!');
      setFormData({
        name: '',
        location: '',
        price: '',
        startDate: '',
        endDate: '',
        description: '',
        capacity: '',
        registrationDeadline: ''
      });
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Error creating trip');
    }
  };

  return (
    <div className="create-trip-container">
      <h2>Create a New Trip</h2>
      <form onSubmit={handleSubmit} className="trip-form">
        <label>Trip Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>Location</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} required />

        <label>Price (EGP)</label>
        <input type="number" name="price" value={formData.price} onChange={handleChange} required />

        <label>Start Date & Time</label>
        <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} required />

        <label>End Date & Time</label>
        <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} required />

        <label>Short Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required />

        <label>Capacity</label>
        <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required />

        <label>Registration Deadline</label>
        <input type="datetime-local" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} required />

        <button type="submit">Create Trip</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateTrip;

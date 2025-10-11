import React, { useState } from 'react';
import { api } from '../api';

const ConferenceForm = ({ onSuccess, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    type: 'conference',
    title: initialData?.title || '',
    desc: initialData?.desc || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    registrationDeadline: initialData?.registrationDeadline ? new Date(initialData.registrationDeadline).toISOString().slice(0, 16) : '',
    fullAgenda: initialData?.fullAgenda || '',
    websiteLink: initialData?.websiteLink || '',
    requiredBudget: initialData?.requiredBudget || '',
    fundraisingSource: initialData?.fundraisingSource || '',
    extraRequiredResource: initialData?.extraRequiredResource || '',
    status: initialData?.status || 'pending'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Conference name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date and time is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date and time is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (!formData.websiteLink.trim()) {
      newErrors.websiteLink = 'Conference website link is required';
    } else {
      try {
        new URL(formData.websiteLink);
      } catch {
        newErrors.websiteLink = 'Please enter a valid URL';
      }
    }

    if (formData.requiredBudget && isNaN(parseFloat(formData.requiredBudget))) {
      newErrors.requiredBudget = 'Budget must be a valid number';
    }

    if (!formData.fundraisingSource) {
      newErrors.fundraisingSource = 'Source of funding is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        requiredBudget: formData.requiredBudget ? parseFloat(formData.requiredBudget) : undefined,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline) : undefined
      };

      if (initialData) {
        // Update existing conference
        await api.put(`/events/${initialData._id}`, submitData);
        onSuccess('Conference updated successfully!');
      } else {
        // Create new conference
        await api.post('/events', submitData);
        onSuccess('Conference created successfully!');
      }
    } catch (error) {
      console.error('Error saving conference:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save conference';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {initialData ? 'Edit Conference' : 'Create New Conference'}
        </h2>
        <p className="text-gray-600">
          Fill in the conference details below. The conference website will contain all the conference's details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Conference Name */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Conference Name *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter conference name"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Short Description */}
        <div>
          <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-2">
            Short Description
          </label>
          <textarea
            id="desc"
            name="desc"
            value={formData.desc}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of the conference"
          />
        </div>

        {/* Date and Time Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
          </div>
        </div>

        {/* Registration Deadline */}
        <div>
          <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-2">
            Registration Deadline
          </label>
          <input
            type="datetime-local"
            id="registrationDeadline"
            name="registrationDeadline"
            value={formData.registrationDeadline}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Full Agenda */}
        <div>
          <label htmlFor="fullAgenda" className="block text-sm font-medium text-gray-700 mb-2">
            Full Agenda
          </label>
          <textarea
            id="fullAgenda"
            name="fullAgenda"
            value={formData.fullAgenda}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed agenda of the conference"
          />
        </div>

        {/* Conference Website Link */}
        <div>
          <label htmlFor="websiteLink" className="block text-sm font-medium text-gray-700 mb-2">
            Conference Website Link *
          </label>
          <input
            type="url"
            id="websiteLink"
            name="websiteLink"
            value={formData.websiteLink}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.websiteLink ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://example.com/conference"
          />
          {errors.websiteLink && <p className="mt-1 text-sm text-red-600">{errors.websiteLink}</p>}
          <p className="mt-1 text-sm text-gray-500">
            The conference website will contain all the conference's details. Each conference usually has a landing page.
          </p>
        </div>

        {/* Budget and Funding */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="requiredBudget" className="block text-sm font-medium text-gray-700 mb-2">
              Required Budget
            </label>
            <input
              type="number"
              id="requiredBudget"
              name="requiredBudget"
              value={formData.requiredBudget}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.requiredBudget ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.requiredBudget && <p className="mt-1 text-sm text-red-600">{errors.requiredBudget}</p>}
          </div>

          <div>
            <label htmlFor="fundraisingSource" className="block text-sm font-medium text-gray-700 mb-2">
              Source of Funding *
            </label>
            <select
              id="fundraisingSource"
              name="fundraisingSource"
              value={formData.fundraisingSource}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fundraisingSource ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select funding source</option>
              <option value="GUC">GUC</option>
              <option value="External">External</option>
            </select>
            {errors.fundraisingSource && <p className="mt-1 text-sm text-red-600">{errors.fundraisingSource}</p>}
          </div>
        </div>

        {/* Extra Required Resources */}
        <div>
          <label htmlFor="extraRequiredResource" className="block text-sm font-medium text-gray-700 mb-2">
            Extra Required Resources
          </label>
          <textarea
            id="extraRequiredResource"
            name="extraRequiredResource"
            value={formData.extraRequiredResource}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional resources needed for the conference"
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Conference' : 'Create Conference')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConferenceForm;

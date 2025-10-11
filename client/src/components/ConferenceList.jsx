import React, { useState, useEffect } from 'react';
import { api } from '../api';

const ConferenceList = ({ onEdit, onView }) => {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events?type=conference');
      setConferences(response.data);
    } catch (err) {
      console.error('Error fetching conferences:', err);
      setError('Failed to load conferences');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this conference?')) {
      return;
    }

    try {
      await api.delete(`/events/${id}`);
      setConferences(conferences.filter(conf => conf._id !== id));
    } catch (err) {
      console.error('Error deleting conference:', err);
      alert('Failed to delete conference');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredConferences = conferences.filter(conf => 
    filterStatus === 'all' || conf.status === filterStatus
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading conferences...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchConferences}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Conferences</h2>
        <div className="flex items-center space-x-4">
          <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
            Filter by status:
          </label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Conferences Grid */}
      {filteredConferences.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No conferences found</h3>
          <p className="text-gray-500">
            {filterStatus === 'all' 
              ? 'No conferences have been created yet.' 
              : `No conferences with status "${filterStatus}" found.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConferences.map((conference) => (
            <div key={conference._id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {conference.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conference.status)}`}>
                    {conference.status}
                  </span>
                </div>

                {/* Description */}
                {conference.desc && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {conference.desc}
                  </p>
                )}

                {/* Dates */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Start:</span>
                    <span>{formatDate(conference.startDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">End:</span>
                    <span>{formatDate(conference.endDate)}</span>
                  </div>
                  {conference.registrationDeadline && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium mr-2">Deadline:</span>
                      <span>{formatDate(conference.registrationDeadline)}</span>
                    </div>
                  )}
                </div>

                {/* Budget and Funding */}
                <div className="space-y-2 mb-4">
                  {conference.requiredBudget && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium mr-2">Budget:</span>
                      <span>${conference.requiredBudget.toLocaleString()}</span>
                    </div>
                  )}
                  {conference.fundraisingSource && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium mr-2">Funding:</span>
                      <span>{conference.fundraisingSource}</span>
                    </div>
                  )}
                </div>

                {/* Website Link */}
                {conference.websiteLink && (
                  <div className="mb-4">
                    <a
                      href={conference.websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Visit Conference Website →
                    </a>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onView(conference)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(conference)}
                    className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(conference._id)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConferenceList;

import React from 'react';

const ConferenceDetail = ({ conference, onEdit, onClose }) => {
  if (!conference) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">No conference selected</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{conference.title}</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(conference.status)}`}>
                {conference.status.charAt(0).toUpperCase() + conference.status.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                Created: {formatDate(conference.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(conference)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-8">
        {/* Description */}
        {conference.desc && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">{conference.desc}</p>
          </div>
        )}

        {/* Schedule */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Start Date & Time</h3>
              <p className="text-gray-600">{formatDate(conference.startDate)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">End Date & Time</h3>
              <p className="text-gray-600">{formatDate(conference.endDate)}</p>
            </div>
            {conference.registrationDeadline && (
              <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                <h3 className="font-medium text-gray-700 mb-2">Registration Deadline</h3>
                <p className="text-gray-600">{formatDate(conference.registrationDeadline)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget and Funding */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Budget & Funding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {conference.requiredBudget && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Required Budget</h3>
                <p className="text-2xl font-bold text-green-600">
                  ${conference.requiredBudget.toLocaleString()}
                </p>
              </div>
            )}
            {conference.fundraisingSource && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Source of Funding</h3>
                <p className="text-lg font-semibold text-gray-800">
                  {conference.fundraisingSource}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Full Agenda */}
        {conference.fullAgenda && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Full Agenda</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-gray-600 font-sans leading-relaxed">
                {conference.fullAgenda}
              </pre>
            </div>
          </div>
        )}

        {/* Extra Required Resources */}
        {conference.extraRequiredResource && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Extra Required Resources</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 leading-relaxed">{conference.extraRequiredResource}</p>
            </div>
          </div>
        )}

        {/* Conference Website */}
        {conference.websiteLink && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Conference Website</h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <a
                href={conference.websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium text-lg"
              >
                {conference.websiteLink}
              </a>
              <p className="text-sm text-gray-600 mt-2">
                The conference website contains all the conference's details. Each conference usually has a landing page.
              </p>
            </div>
          </div>
        )}

        {/* Organizer Information */}
        {conference.organizerId && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Organizer</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600">
                Organizer ID: {conference.organizerId}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConferenceDetail;

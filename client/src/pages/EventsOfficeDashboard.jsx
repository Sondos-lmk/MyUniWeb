import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConferenceForm from '../components/ConferenceForm';
import ConferenceList from '../components/ConferenceList';
import ConferenceDetail from '../components/ConferenceDetail';

const EventsOfficeDashboard = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [selectedConference, setSelectedConference] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const handleCreateConference = () => {
    setSelectedConference(null);
    setCurrentView('create');
    setSuccessMessage('');
  };

  const handleEditConference = (conference) => {
    setSelectedConference(conference);
    setCurrentView('edit');
    setSuccessMessage('');
  };

  const handleViewConference = (conference) => {
    setSelectedConference(conference);
    setCurrentView('view');
    setSuccessMessage('');
  };

  const handleFormSuccess = (message) => {
    setSuccessMessage(message);
    setCurrentView('list');
    setSelectedConference(null);
  };

  const handleFormCancel = () => {
    setCurrentView('list');
    setSelectedConference(null);
    setSuccessMessage('');
  };

  const handleCloseDetail = () => {
    setCurrentView('list');
    setSelectedConference(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'create':
        return (
          <ConferenceForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        );
      case 'edit':
        return (
          <ConferenceForm
            initialData={selectedConference}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        );
      case 'view':
        return (
          <ConferenceDetail
            conference={selectedConference}
            onEdit={handleEditConference}
            onClose={handleCloseDetail}
          />
        );
      case 'list':
      default:
        return (
          <ConferenceList
            onEdit={handleEditConference}
            onView={handleViewConference}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Events Office Dashboard</h1>
              <p className="text-gray-600">Manage conferences and events</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, Events Office
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Conferences
            </button>
            <button
              onClick={handleCreateConference}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Conference
            </button>
          </nav>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setSuccessMessage('')}
                  className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>

      {/* Quick Actions for List View */}
      {currentView === 'list' && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleCreateConference}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Create New Conference"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsOfficeDashboard;

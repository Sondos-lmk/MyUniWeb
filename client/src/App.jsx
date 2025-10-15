// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

import Signup from './pages/Signup';
import Verify from './pages/Verify';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import EventOfficerDashboard from './pages/EventOfficerDashboard';

// NEW pages/components for reqs 33,34,40,41
import Navbar from './components/Navbar';
import Events from './pages/Events';
import MyApplications from './pages/MyApplications';
import MyEvents from './pages/MyEvents';
import BazaarApply from './pages/BazaarApply';
import BoothApply from './pages/BoothApply';
import EventDetails from './pages/EventDetails';
import TestEventCard from './pages/TestEventCard';

// Improved ProtectedRoute: if allowedRole is provided, enforce it; otherwise only require login.
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/" />;
  }
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show navbar globally (hide on auth pages later if you want) */}
      {/* <Navbar /> */}

      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify/:token" element={<Verify />} />

        {/* Simple visual test page for EventCard */}
        {/* <Route path="/test-card" element={<TestEventCard />} /> */}

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Existing dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Events hub (list is public) */}
        <Route path="/events" element={<Events />} />

        {/* Event details: your backend requires auth for GET /events/:id */}
        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          }
        />

        {/* Vendor flows (auth) */}
        <Route
          path="/bazaars/:bazaarId/apply"
          element={
            <ProtectedRoute>
              <BazaarApply />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booths/:boothId/apply"
          element={
            <ProtectedRoute>
              <BoothApply />
            </ProtectedRoute>
          }
        />

        {/* Me (auth) */}
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-events"
          element={
            <ProtectedRoute>
              <MyEvents />
            </ProtectedRoute>
          }
        />

        {/* Event Officer Dashboard */}
        <Route
          path="/eventOfficer/dashboard"
          element={
            <ProtectedRoute allowedRole="eventOfficer">
              <EventOfficerDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;

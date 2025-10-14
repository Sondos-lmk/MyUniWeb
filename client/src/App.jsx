import { Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import EventOfficerDashboard from './pages/EventOfficerDashboard';
import CreateTrip from './pages/CreateTrip.jsx';

// NEW pages/components for reqs 33,34,40,41
import Navbar from './components/Navbar';
import Events from './pages/Events';
import MyApplications from './pages/MyApplications';
import MyEvents from './pages/MyEvents';
import BazaarApply from './pages/BazaarApply';
import BoothApply from './pages/BoothApply';
import EventDetails from './pages/EventDetails';
import TestEventCard from './pages/TestEventCard';

// ✅ Improved ProtectedRoute component
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // No token → not logged in
  if (!token) {
    console.log('No token — redirecting to /');
    return <Navigate to="/" replace />; // ✅ redirect to "/" instead of "/login"
  }

  // Logged in but not allowed → redirect to own dashboard
  if (allowedRole && role !== allowedRole) {
    console.log(`Role mismatch (${role} !== ${allowedRole}) — redirecting to /dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, allow access
  return children;
}


function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify/:token" element={<Verify />} />

        {/* ✅ Protected routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eventOfficer/dashboard"
          element={
            <ProtectedRoute allowedRole="eventOfficer">
              <EventOfficerDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;

// import { Routes, Route, Navigate } from 'react-router-dom';
// import Signup from './pages/Signup';
// import Verify from './pages/Verify';
// import Login from './pages/Login';
// import AdminDashboard from './pages/AdminDashboard';
// import NotFound from './pages/NotFound';
// import Dashboard from './pages/Dashboard';
// import CreateTrip from './pages/CreateTrip.jsx';




// function ProtectedRoute({ children, allowedRole }) {
//   const token = localStorage.getItem('token');
//   const role = localStorage.getItem('role');
//   console.log('ProtectedRoute - token:', !!token, 'role:', role); // Debug: Check auth
//   if (!token || role !== allowedRole) {
//     console.log(`ProtectedRoute redirecting to /, token: ${!!token}, role: ${role}`); // Debug
//     return <Navigate to="/" />;
//   }
//   return children;
// }

// function App() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/verify/:token" element={<Verify />} />
//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute allowedRole="admin">
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="*" element={<NotFound />} />
//         <Route path="/create-trip"element={<ProtectedRoute requiredRole="eventOfficer">
//       <CreateTrip />
//     </ProtectedRoute>
//   }
// />


//       </Routes>
//     </div>
//   );
// }

// export default App;
//marwan:
// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

import Signup from './pages/Signup';
import Verify from './pages/Verify';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip.jsx';

// ⬇️ NEW imports for your requirements (33, 34, 40, 41)
import Navbar from './components/Navbar';
import Events from './pages/Events';
import MyApplications from './pages/MyApplications';
import MyEvents from './pages/MyEvents';
import BazaarApply from './pages/BazaarApply';
import BoothApply from './pages/BoothApply';
import EventDetails from './pages/EventDetails';
import TestEventCard from "./pages/TestEventCard";

// Smarter ProtectedRoute: if allowedRole is provided, enforce it; otherwise only require login.
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
      {/* Optional: hide Navbar on auth pages if you want; for now, show it globally */}
      <Navbar />

      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/test-card" element={<TestEventCard />} />

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

        {/* ✅ NEW: Events Hub (public list) */}
        <Route path="/events" element={<Events />} />

        {/* ✅ NEW: Event Details (your backend requires auth for GET /events/:id) */}
        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          }
        />

        {/* ✅ NEW: Vendor flows (auth required by backend) */}
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

        {/* ✅ NEW: My Applications & My Registered Events (auth) */}
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

        {/* Create Trip (event officer only) — fixed prop name */}
        <Route
          path="/create-trip"
          element={
            <ProtectedRoute allowedRole="eventOfficer">
              <CreateTrip />
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

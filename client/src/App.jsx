// client/src/App.jsx
import { Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import EventOfficerDashboard from "./pages/EventOfficerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify/:token" element={<Verify />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Event Officer Routes */}
        <Route element={<ProtectedRoute allowedRoles={["eventOfficer"]} />}>
          <Route path="/eventOfficer/dashboard" element={<EventOfficerDashboard />} />
        </Route>

        {/* General User Dashboard (vendors, students, etc.) */}
        <Route element={<ProtectedRoute allowedRoles={["vendor", "student", "ta", "professor"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;

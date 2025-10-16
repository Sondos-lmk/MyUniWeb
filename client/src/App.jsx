import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import StudentDashboard from "./pages/StudentDashboard";

import CreateWorkshop from "./pages/CreateWorkshop";
import EditWorkshop from "./pages/EditWorkshop";
import EventOfficerDashboard from "./pages/EventOfficerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";




function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify/:token" element={<Verify />} />

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Event Officer routes */}
        <Route element={<ProtectedRoute allowedRoles={["eventOfficer"]} />}>
           <Route path="/eventOfficer/dashboard" element={<EventOfficerDashboard />} />
        </Route>

        {/* Student routes */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
           <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>



        {/* Professor-only routes (your feature) */}
        <Route element={<ProtectedRoute allowedRoles={["professor"]} />}>
          <Route path="/professor/workshops/new" element={<CreateWorkshop />} />
          <Route path="/professor/workshops/:id/edit" element={<EditWorkshop />} />
        </Route>

        {/* General user dashboard (vendors, students, TAs, professors) */}
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

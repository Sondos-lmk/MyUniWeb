import { Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip.jsx';
import CreateWorkshop from "./pages/CreateWorkshop";
import EditWorkshop from "./pages/EditWorkshop";

import "./App.css";



function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  console.log('ProtectedRoute - token:', !!token, 'role:', role); // Debug: Check auth
  if (!token || role !== allowedRole) {
    console.log(`ProtectedRoute redirecting to /, token: ${!!token}, role: ${role}`); // Debug
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/*/Public routes*/}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin-only */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"> <AdminDashboard /> </ProtectedRoute>}/>

         {/* Professor-only: Create Workshop */}
        <Route
          path="/professor/workshops/new"
          element={
            <ProtectedRoute allowedRole="professor">
              <CreateWorkshop />
            </ProtectedRoute>
          }
        />

       <Route
          path="/create-trip"
          element={
            <ProtectedRoute allowedRole="eventOfficer">
              <CreateTrip />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
  
        <Route
          path="/professor/workshops/:id/edit"
          element={
            <ProtectedRoute allowedRole="professor">
              <EditWorkshop />
            </ProtectedRoute>
          }
        />




      </Routes>
    </div>
  );
}

export default App;
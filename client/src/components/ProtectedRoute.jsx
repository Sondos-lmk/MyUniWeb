// client/src/components/protectedroutes.jsx
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NotFound from "../pages/NotFound";
import { getMyFavorites } from "../services/api";


export default function ProtectedRoute({ allowedRoles, children}) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");
  const role = user?.role || localStorage.getItem("role");
  const location = useLocation();

  // 1️⃣ Still loading → show nothing or a loading spinner
  if (loading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  // 2️⃣ Not logged in → go to login
  if (!token || !user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // 3️⃣ Role not allowed → show NotFound, stay on current URL
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <NotFound />;
  }

  // 4️⃣ Everything OK → show the child route
  return  children ? children : <Outlet />;
}
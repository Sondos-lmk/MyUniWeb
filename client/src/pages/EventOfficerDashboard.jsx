import { useAuth } from "../context/AuthContext";
import { useNavigate , Link } from "react-router-dom";
import ApprovingEvents from "../components/ApprovingEvents.jsx";


function EventOfficerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : "Event Officer"}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
      <div className="flex gap-4 mb-8">
      <Link
        to="/create-gym-session"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Create Gym Session
      </Link>

      <Link
        to="/gym-schedule"
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
      >
        View Gym Schedule
      </Link>
    </div>

      {/* Use the new component */}
      <ApprovingEvents token={token} />
    </div>
  );
}

export default EventOfficerDashboard;

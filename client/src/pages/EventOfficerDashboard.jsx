import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ApprovingEvents from "../components/ApprovingEvents.jsx";
import Navbar from "../components/Navbar.jsx";

function EventOfficerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   navigate("/");
  // };

  return (
    <div>
      {/* ✅ Navbar appears at the top */}
      <Navbar />

      <div className="p-10">
        <h1 className="text-2xl font-bold mb-6">
          Welcome,{" "}
          {user?.name
            ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
            : "Event Officer"}
        </h1>

        {/* Uncomment when ready to show events */}
        {/* <ApprovingEvents /> */}
      </div>
    </div>
  );
}
export default EventOfficerDashboard;

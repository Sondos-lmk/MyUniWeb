import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import ApprovingEvents from "../components/ApprovingEvents.jsx";
import UpcomingEvents from "../components/UpcomingEvents.jsx";
import AttendeesReport from "../components/AttendeesReport";


import Navbar from "../components/Navbar.jsx";


function EventOfficerDashboard() {
  const { user } = useAuth();

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
        {/* Logout handled by Navbar */}
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

        {/* Uncomment when ready to show events */}
        {/* <ApprovingEvents />
        {/* Upcoming Events Section */}
        <div className="mt-10">
          <UpcomingEvents />
        </div>
        {/* Attendees Report available to Event Officers */}
        <div className="mt-10">
          <AttendeesReport />
        </div>
    </div>
    
          
    
  );
}
export default EventOfficerDashboard;

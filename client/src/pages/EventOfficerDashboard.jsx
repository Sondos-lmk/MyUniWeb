import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import UpcomingEvents from "../components/UpcomingEvents.jsx";
import AttendeesReport from "../components/AttendeesReport";
import RevenueReport from "../components/RevenueReport";
import Navbar from "../components/Navbar.jsx";

function EventOfficerDashboard() {
  const { user } = useAuth();

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      <div className="p-10">
        <h1 className="text-2xl font-bold mb-6">
          Welcome,{" "}
          {user?.name
            ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
            : "Event Officer"}
        </h1>
      </div>

      {/* Attendees report */}
      <div className="mt-10 px-10 mb-10">
        <AttendeesReport />
      </div>

      {/* Revenue report */}
      <div className="mt-10 px-10 mb-10">
        <RevenueReport />
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
      {/* vendor BUTTON HERE */}
      <Link
        to="/loyalty-vendors"
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
      >
      Loyalty Vendors
      </Link>



    </div>

      {/* TOP BUTTONS */}
      <div className="flex gap-4 mb-8 px-10">
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

        <Link
          to="/eventOfficer/archived-events"
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          View Archived Events
        </Link>
      </div>

      {/* Upcoming Events */}
      <div className="mt-10 px-10">
        <UpcomingEvents />
      </div>
    </div>
  );
}

export default EventOfficerDashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const StaffDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
        const eventsRes = await axios.get(`${apiUrl}/api/events/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingEvents(eventsRes.data.events || []);
      } catch (err) {
        console.error("Error fetching staff dashboard data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <ProtectedDashboard allowedRoles={["staff"]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* 
        Section 1: My Registered Events (Commented Out)
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">My Registered Events</h2>
          <p>Coming soon...</p>
        </div>
        */}

        {/* Section 2: Upcoming Events */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p>No upcoming events available.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="border p-2 rounded">
                  <p><strong>{event.title}</strong> — {event.type}</p>
                  <p>{event.location}</p>
                  <p>
                    {new Date(event.startDate).toLocaleDateString()} to{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ProtectedDashboard>
  );
};

export default StaffDashboard;

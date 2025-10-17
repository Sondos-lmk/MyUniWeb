import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UpcomingEvents from "../components/UpcomingEvents";

const StudentDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]); // 👈 store upcoming approved events
  const [myEvents, setMyEvents] = useState([]);             // 👈 store events the student registered for
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

        // ✅ Fetch upcoming approved events
        const eventsRes = await axios.get(`${apiUrl}/api/events/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingEvents(eventsRes.data.events || []);

        // ✅ Fetch student’s registered events
        const myEventsRes = await axios.get(`${apiUrl}/api/events/my-registered`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyEvents(myEventsRes.data || []);
      } catch (err) {
        console.error("Error fetching student dashboard data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [navigate]);

    const handleLogout = () => {
      console.log('Logging out from StudentDashboard, token:', localStorage.getItem('token'));
      localStorage.removeItem('token');
      navigate('/');
    };


  return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Section 1: My Registered Events */}
        {/* <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">My Registered Events</h2>
          {myEvents.length === 0 ? (
            <p>No events registered yet.</p>
          ) : (
            <ul className="space-y-2">
              {myEvents.map((event) => (
                <li key={event._id} className="border p-2 rounded">
                  <p><strong>{event.title}</strong> — {event.type}</p>
                  <p>
                    {new Date(event.startDate).toLocaleDateString()} to{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div> */}

      {/* Upcoming Events Section */}
      <div className="mt-10">
        <UpcomingEvents />
      </div>
      </div>
  );
};

export default StudentDashboard;

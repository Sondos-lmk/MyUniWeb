import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UpcomingEvents from "../components/UpcomingEvents";


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
      console.log('Logging out from StudentDashboard, token:', localStorage.getItem('token'));
      localStorage.removeItem('token');
      navigate('/');
    };

  return (
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

      {/* Upcoming Events Section */}
      <div className="mt-10">
        <UpcomingEvents />
      </div>
      </div>
  );
};

export default StaffDashboard;

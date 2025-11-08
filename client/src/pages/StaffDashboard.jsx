import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UpcomingEvents from "../components/UpcomingEvents";
import MyRegisteredEvents from "./MyRegisteredEvents";
import RegisterForEvent from "./RegisterForEvent";
import GymSchedule from "./GymSchedule";
import AttendedEvents from "./AttendedEvents.jsx";             
const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState("events"); // "events" | "registered" | "register" | "gym"
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
        const res = await axios.get(`${apiUrl}/api/events/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingEvents(res.data.events || []);
      } catch (err) {
        console.error("Error fetching staff dashboard data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchEvents();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Staff Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded ${
            activeTab === "events"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Upcoming Events
        </button>

        <button
          onClick={() => setActiveTab("registered")}
          className={`px-4 py-2 rounded ${
            activeTab === "registered"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          My Registered Events
        </button>

        <button
          onClick={() => setActiveTab("register")}
          className={`px-4 py-2 rounded ${
            activeTab === "register"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Register for Event
        </button>
        <button
  type="button"
  onClick={() => setActiveTab("attended")}
  className={activeTab === "attended"
    ? "px-4 py-2 rounded bg-blue-600 text-white"
    : "px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"}
>
  Attended Events
</button>

        <button
          onClick={() => setActiveTab("gym")}
          className={`px-4 py-2 rounded ${
            activeTab === "gym"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Gym Schedule
        </button>
      </div>

      {/* EVENTS VIEW */}
      {activeTab === "events" && (
        <div className="mt-6">
          <UpcomingEvents /> 
        </div>
      )}

      {/* My Registered Events */}
      {activeTab === "registered" && (
        <div className="mt-6">
          <MyRegisteredEvents />
        </div>
      )}

      {/* Register for Event */}
      {activeTab === "register" && (
        <div className="mt-6">
          <RegisterForEvent />
        </div>
      )}
      {/* ATTENDED EVENTS */}
{activeTab === "attended" && (
  <div className="mt-6">
    <AttendedEvents />
  </div>
)}


      {/* Gym Schedule */}
      {activeTab === "gym" && (
        <div className="mt-6">
          <GymSchedule />
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;

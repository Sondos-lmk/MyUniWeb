import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UpcomingEvents from "../components/UpcomingEvents";
//import MyRegisteredEvents from "./MyRegisteredEvents";
import RegisterForEvent from "./RegisterForEvent";
import GymSchedule from "./GymSchedule";
import api from "../services/api";
import WalletButton from "../components/WalletButton";  // <-- ADD THIS IMPORT
import NotificationBell from "../components/NotificationBell";


const StudentDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("events"); // "events" | "registered" | "register" | "courts" | "gym"
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch upcoming events and registered ones
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

        // Fetch upcoming approved events
        const eventsRes = await axios.get(`${apiUrl}/api/events/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingEvents(eventsRes.data.events || []);

        // Fetch student's registered events
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

  // Logout
  const handleLogout = () => {
    console.log("Logging out from StudentDashboard, token:", localStorage.getItem("token"));
    localStorage.removeItem("token");
    navigate("/");
  };

  // Fetch all courts
  const fetchCourts = async () => {
    setLoadingCourts(true);
    try {
      const res = await api.get("/courts");
      setCourts(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load courts.");
    } finally {
      setLoadingCourts(false);
    }
  };

  // Fetch court availability
  const fetchAvailability = async (courtId) => {
    setSelectedCourt(courtId);
    setLoadingCourts(true);
    try {
      const res = await api.get(`/courts/${courtId}/availability`);
      setAvailability(res.data.days || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not fetch availability.");
    } finally {
      setLoadingCourts(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700">Student Dashboard</h1>
        <div className="flex items-center gap-4">
    <WalletButton />  {/* <-- NEW WALLET BUTTON */}
    <div className="flex items-center gap-4">
          {/* ⭐ Notification Bell */}
          <NotificationBell />
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center gap-4 mt-4 mb-8">
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
          onClick={() => {
            setActiveTab("courts");
            fetchCourts();
          }}
          className={`px-4 py-2 rounded ${
            activeTab === "courts"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          View Courts
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


      {/* MY REGISTERED EVENTS */}
      {activeTab === "registered" && (
        <div className="mt-6">
          <MyRegisteredEvents />
        </div>
      )}

      {/* REGISTER FOR EVENT */}
      {activeTab === "register" && (
        <div className="mt-6">
          <RegisterForEvent />
        </div>
      )}

      {/* COURTS VIEW */}
      {activeTab === "courts" && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-4">Campus Courts</h2>
          {error && <p className="text-red-600 text-center">{error}</p>}
          {loadingCourts ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courts.map((court) => (
                <div
                  key={court._id}
                  className={`border rounded-lg p-4 shadow cursor-pointer ${
                    selectedCourt === court._id ? "bg-blue-50" : "bg-white"
                  }`}
                  onClick={() => fetchAvailability(court._id)}
                >
                  <h3 className="text-xl font-semibold">{court.name}</h3>
                  <p className="capitalize text-gray-600">{court.type}</p>
                  <p className="text-sm text-gray-500">{court.location}</p>
                </div>
              ))}
            </div>
          )}

          {availability.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-center mb-2">
                Availability
              </h3>
              <div className="grid gap-3">
                {availability.map((day) => (
                  <div
                    key={day.date}
                    className="border rounded-md p-3 bg-gray-50 shadow-sm"
                  >
                    <p className="font-semibold">{day.date}</p>
                    {day.slots.length > 0 ? (
                      <ul className="ml-4 list-disc">
                        {day.slots.map((slot, i) => (
                          <li key={i}>
                            {slot.startTime} - {slot.endTime}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No available slots</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GYM SCHEDULE */}
      {activeTab === "gym" && (
        <div className="mt-6">
          <GymSchedule />
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

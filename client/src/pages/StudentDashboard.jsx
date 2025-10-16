import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/api";

const StudentDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]); // 👈 store upcoming approved events
  const [myEvents, setMyEvents] = useState([]);             // 👈 store events the student registered for
  const navigate = useNavigate();
  const [showCourts, setShowCourts] = useState(false);
const [courts, setCourts] = useState([]);
const [selectedCourt, setSelectedCourt] = useState(null);
const [availability, setAvailability] = useState([]);
const [loadingCourts, setLoadingCourts] = useState(false);
const [error, setError] = useState("");

  

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
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchCourts = async () => {
  setLoadingCourts(true);
  try {
    const res = await api.get("/courts");
    setCourts(res.data);
  } catch (err) {
    console.error(err);
    setError("Failed to load courts.");
  } finally {
    setLoadingCourts(false);
  }
};

const fetchAvailability = async (courtId) => {
  setSelectedCourt(courtId);
  setLoadingCourts(true);
  try {
    const res = await api.get(`/courts/${courtId}/availability`);
    setAvailability(res.data.days || []);
  } catch (err) {
    console.error(err);
    setError("Could not fetch availability.");
  } finally {
    setLoadingCourts(false);
  }
};


  return (
    <ProtectedDashboard allowedRoles={["student"]}>
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
          <div className="flex justify-center gap-4 mt-4">
  <button
    onClick={() => setShowCourts(false)}
    className={`px-4 py-2 rounded ${!showCourts ? "bg-blue-600 text-white" : "bg-gray-200"}`}
  >
    Events
  </button>
  <button
    onClick={() => {
      setShowCourts(true);
      fetchCourts();
    }}
    className={`px-4 py-2 rounded ${showCourts ? "bg-blue-600 text-white" : "bg-gray-200"}`}
  >
    View Courts
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

        {/* Section 2: Upcoming Events */}
        {!showCourts && (
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
)}
{showCourts && (
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
        <h3 className="text-xl font-bold text-center mb-2">Availability</h3>
        <div className="grid gap-3">
          {availability.map((day) => (
            <div key={day.date} className="border rounded-md p-3 bg-gray-50 shadow-sm">
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

      </div>
    </ProtectedDashboard>
  );
};

export default StudentDashboard;

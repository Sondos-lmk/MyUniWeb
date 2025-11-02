import React, { useEffect, useState } from "react";
import API from "../services/api";

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [type, setType] = useState("");

  // Fetch all upcoming events (default)
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/events/upcoming", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data.events || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load upcoming events.");
    } finally {
      setLoading(false);
    }
  };

  // Search by name/type
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchName && !type) {
      fetchEvents();
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/events/search", {
        params: { name: searchName, type },
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data.events || []);
      setError(null);
    } catch (err) {
      console.error("Error searching events:", err);
      if (err.response?.status === 404)
        setError("No events found matching your search.");
      else setError("Failed to search events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>

      {/* 🔍 Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap gap-3 mb-4 items-center"
      >
        <input
          type="text"
          placeholder="Search by event or professor name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border rounded-lg px-3 py-2 w-60 focus:ring focus:ring-blue-200"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded-lg px-3 py-2 w-40"
        >
          <option value="">All Types</option>
          <option value="workshop">Workshop</option>
          <option value="trip">Trip</option>
          <option value="bazaar">Bazaar</option>
          <option value="booth">Booth</option>
          <option value="conference">Conference</option>
          <option value="gym">Gym Session</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Search
        </button>

        {(searchName || type) && (
          <button
            type="button"
            onClick={() => {
              setSearchName("");
              setType("");
              fetchEvents();
            }}
            className="text-sm text-gray-600 underline"
          >
            Clear
          </button>
        )}
      </form>

      {/* ⚙️ Loading & Error States */}
      {loading && <p>Loading events...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p>No upcoming events available.</p>
      )}

      {/* 📋 Event List */}
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="border p-4 rounded-lg shadow-sm bg-white"
          >
            {event.type === "gym" ? (
              <>
                <h3 className="text-lg font-bold">
                  Gym Session{event.sessionType ? ` - ${event.sessionType.charAt(0).toUpperCase() + event.sessionType.slice(1)}` : ''}
                </h3>
                <p><strong>Type:</strong> {event.type}</p>
                {event.sessionType && (
                  <p><strong>Session Type:</strong> <span className="capitalize">{event.sessionType}</span></p>
                )}
                {event.date && (
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                )}
                {event.time && (
                  <p><strong>Time:</strong> {event.time}</p>
                )}
                {event.duration && (
                  <p><strong>Duration:</strong> {event.duration} minutes</p>
                )}
                {event.maxParticipants !== undefined && (
                  <p><strong>Max Participants:</strong> {event.maxParticipants}</p>
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">{event.title}</h3>
                <p><strong>Type:</strong> {event.type}</p>
                <p><strong>Description:</strong> {event.description || "No description"}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Start:</strong> {new Date(event.startDate).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(event.endDate).toLocaleString()}</p>
                {event.status && (event.type === "workshop" || event.type === "booth") && (
                  <p><strong>Status:</strong> {event.status}</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;

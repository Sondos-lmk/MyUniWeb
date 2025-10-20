import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function RegisterForEvent() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [uniID, setUniID] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch only workshops & trips
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events/upcoming");
        const allEvents = res.data.events || [];
        console.log("📦 Events loaded:", allEvents);
        const filtered = allEvents.filter(
          (event) => event.type === "workshop" || event.type === "trip"
        );
        setEvents(filtered);
      } catch (err) {
        console.error("Error loading events:", err);
        setMessage("Failed to load events.");
      }
    };

    fetchEvents();
  }, []);

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) {
      setMessage("Please select an event.");
      return;
    }

    setLoading(true);
    try {
      // You can include name/email/uniID here just for record-keeping if you want,
      // but backend only needs eventId (user is inferred from JWT).
      console.log("🔍 Submitting eventId:", selectedEvent);
      const res = await api.post(`/events/register/${selectedEvent}`, {
        eventId: selectedEvent,
        name,
        email,
        uniID,
      });

      setMessage(res.data.message || "✅ Successfully registered!");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "❌ Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Register for Workshop / Trip
        </h2>

        {/* Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:ring focus:ring-blue-300"
          required
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:ring focus:ring-blue-300"
          required
        />

        {/* University ID */}
        <input
          type="text"
          placeholder="University ID"
          value={uniID}
          onChange={(e) => setUniID(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:ring focus:ring-blue-300"
          required
        />

        {/* Event Dropdown */}
        <label className="block font-semibold text-gray-700 mb-2">
          Choose Event:
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4 focus:ring focus:ring-blue-300"
        >
          <option value="">-- Select Workshop or Trip --</option>
          {events.length > 0 ? (
            events.map((event) => (
          <option key={event._id || event.id} value={event._id || event.id}>
            {event.title} ({event.type}) — {new Date(event.startDate).toLocaleDateString()}
          </option>

            ))
          ) : (
            <option disabled>No workshops or trips available</option>
          )}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {message && (
          <p className="text-center mt-3 text-gray-700 font-medium">{message}</p>
        )}
      </form>
    </div>
  );
}

// client/src/components/Event.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import EventCard from "../components/EventCard";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(""); // ✅ added
  const [success, setSuccess] = useState(""); // ✅ added
  const [loading, setLoading] = useState(true); // ✅ added
  const userRole = localStorage.getItem("role") || "guest"; // ✅ changed from hardcoded

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const res = await API.get("/events/");
        setEvents(res.data || []);
      } catch (err) {
        console.error("Error fetching upcoming events:", err);
        setError("Failed to load events."); // ✅ added
      } finally {
        setLoading(false); // ✅ added
      }
    };

    fetchUpcomingEvents();
  }, []);

  // ✅ Added delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await API.delete(`/events/${id}`);
      setEvents(events.filter((e) => e._id !== id));
      setSuccess(res.data.message || "Event deleted successfully!");
      setError("");
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(
        err.response?.data?.message ||
          "Cannot delete event. It may have registered users."
      );
      setSuccess("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Events</h1>

      {/* ✅ Added feedback messages */}
      {error && <p className="text-red-600 mb-3 text-center">{error}</p>}
      {success && <p className="text-green-600 mb-3 text-center">{success}</p>}

      {loading ? ( // ✅ Added loading state
        <p className="text-center text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-slate-600">No events found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="border rounded-lg shadow p-4">
              <EventCard event={event} userRole={userRole} />

              {/* ✅ Added delete button (only for eventOfficer or admin) */}
              {(userRole === "eventOfficer" || userRole === "admin") && (
                <button
                  onClick={() => handleDelete(event._id)}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
                >
                  Delete Event
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

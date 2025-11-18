import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ManageAllEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
        const res = await axios.get(`${apiUrl}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data.events || res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDeleteEvent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await axios.delete(`${apiUrl}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(res.data.message || "Event deleted successfully!");
      setError("");
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(
        err.response?.data?.message ||
          "Cannot delete event. Maybe someone registered for it."
      );
    }
  };

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
      
      <h1 className="text-3xl font-bold mb-6">Manage All Events</h1>
      
      {error && <p className="text-red-600 mb-3 p-3 bg-red-50 rounded-lg">{error}</p>}
      {success && <p className="text-green-600 mb-3 p-3 bg-green-50 rounded-lg">{success}</p>}

      {loading ? (
        <p className="text-center text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Title</th>
                <th className="p-3 border">Type</th>
                <th className="p-3 border">Location</th>
                <th className="p-3 border">Start</th>
                <th className="p-3 border">End</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} className="text-center hover:bg-gray-50">
                  <td className="p-3 border">{event.title}</td>
                  <td className="p-3 border">{event.type}</td>
                  <td className="p-3 border">{event.location || "-"}</td>
                  <td className="p-3 border">
                    {event.startDate ? new Date(event.startDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-3 border">
                    {event.endDate ? new Date(event.endDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-3 border">
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function MyRegisteredEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user's registered events when component loads
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events/my-events");
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching registered events:", err);
        setError(
          err.response?.data?.error || "Failed to load your registered events."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading your events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        My Registered Events
      </h1>

      {events.length === 0 ? (
        <p className="text-center text-gray-600">
          You haven’t registered for any events yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-blue-700 mb-2">
                {event.title || "Untitled Event"}
              </h2>
              <p className="text-gray-700 mb-1">
                <strong>Type:</strong> {event.type || "N/A"}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Location:</strong> {event.location || "N/A"}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Start Date:</strong>{" "}
                {event.startDate
                  ? new Date(event.startDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>End Date:</strong>{" "}
                {event.endDate
                  ? new Date(event.endDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Status:</strong> {event.status || "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

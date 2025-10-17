import React, { useEffect, useState } from "react";
import API from "../services/api";

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await API.get("/events/upcoming");
        setEvents(response.data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load upcoming events.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <p>Loading upcoming events...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (events.length === 0) return <p>No upcoming events available.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
      {events.map((event) => (
        <div key={event.id} className="border p-4 rounded-lg shadow-sm bg-white">
          <h3 className="text-lg font-bold">{event.title}</h3>
          <p><strong>Type:</strong> {event.type}</p>
          <p><strong>Description:</strong> {event.description || "No description"}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Start:</strong> {new Date(event.startDate).toLocaleString()}</p>
          <p><strong>End:</strong> {new Date(event.endDate).toLocaleString()}</p>
          <p><strong>Status:</strong> {event.status}</p>

          {["bazaar", "booth"].includes(event.type) && event.vendors?.length > 0 && (
            <div className="mt-2">
              <strong>Vendors Participating:</strong>
              <ul className="list-disc ml-5">
                {event.vendors.map((v, i) => (
                  <li key={i}>{v.vendor?.name} ({v.vendor?.email})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UpcomingEvents;

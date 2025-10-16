// client/src/pages/Events.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import EventCard from "../components/EventCard";

export default function Events() {
  const [events, setEvents] = useState([]);
  const userRole = "eventofficer"; // 🔥 Hardcode temporarily for testing

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const res = await API.get("/events/");
        setEvents(res.data || []);
      } catch (err) {
        console.error("Error fetching upcoming events:", err);
      }
    };

    fetchUpcomingEvents();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Events</h1>

      {events.length === 0 ? (
        <p className="text-slate-600">No events found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event._id} event={event} userRole={userRole} />
          ))}
        </div>
      )}
    </div>
  );
}

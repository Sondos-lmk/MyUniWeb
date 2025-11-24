// client/src/components/Events.jsx
import { useEffect, useState } from "react";
import API from "../services/api";
import EventOfficerEventCard from "./EventOfficeEventCard";
import EditEventForm from "./EditEventForm";
import GenerateVisitorQRModal from "./GenerateVisitorQRModal";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // NEW: modal state
  const [editingEventId, setEditingEventId] = useState(null);
  const [qrEventId, setQrEventId] = useState(null);


  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const res = await API.get("/events/");
        setEvents(res.data.events || []);
      } catch (err) {
        console.error("Error fetching upcoming events:", err);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Events</h1>

      {error && <p className="text-red-600 mb-3 text-center">{error}</p>}
      {success && <p className="text-green-600 mb-3 text-center">{success}</p>}

      {loading ? (
        <p className="text-center text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-slate-600">No events found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventOfficerEventCard
              key={event._id}
              event={event}
              onEdit={(id) => setEditingEventId(id)}
              onGenerateQr={(id) => setQrEventId(id)}
            />
          ))}
        </div>
      )}

      {/* MODAL RENDER — placed OUTSIDE the cards */}
      {editingEventId && (
        <EditEventForm
          eventId={editingEventId}
          onClose={() => setEditingEventId(null)}
        />
      )}
      {qrEventId && (
      <GenerateVisitorQRModal
        eventId={qrEventId}
        onClose={() => setQrEventId(null)}
      />
    )}
    </div>
  );
}

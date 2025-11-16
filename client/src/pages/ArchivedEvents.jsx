import { useEffect, useState } from "react";
import { api } from "../api";
import Navbar from "../components/Navbar";


export default function ArchivedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArchived() {
      try {
        const res = await api.get("/events/archived");
        setEvents(res.data.events);
      } catch (err) {
        setError(err.response?.data?.message || "Error loading archived events");
      } finally {
        setLoading(false);
      }
    }

    fetchArchived();
  }, []);

  if (loading) return <p className="p-10 text-lg">Loading archived events...</p>;
  if (error)
    return (
      <p className="p-10 text-red-500 text-lg">
        Error: {error}
      </p>
    );

  return (
    <div>
      <Navbar />

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Archived Events</h1>

        {events.length === 0 ? (
          <p className="text-gray-600">No archived events found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="border rounded-lg p-5 shadow-md bg-gray-50"
              >
                <h2 className="text-xl font-bold">{event.title || "Untitled Event"}</h2>

                <p><strong>Type:</strong> {event.type}</p>
                {event.location && <p><strong>Location:</strong> {event.location}</p>}
                {event.desc && <p><strong>Description:</strong> {event.desc}</p>}

                <p><strong>Status Before Archiving:</strong> {event.status}</p>

                <p className="mt-2 text-gray-500">
                  <strong>Ended:</strong>{" "}
                  {event.endDate
                    ? new Date(event.endDate).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


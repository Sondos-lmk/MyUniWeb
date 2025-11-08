// // client/src/pages/Favorites.jsx
// import { useEffect, useState } from "react";
// import { getMyFavorites } from "../services/api";
// import EventCard from "../components/EventCard";

// export default function Favorites() {
//   const [loading, setLoading] = useState(true);
//   const [events, setEvents] = useState([]);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const favs = await getMyFavorites();
//         if (mounted) setEvents(favs);
//       } catch (e) {
//         console.error("Failed to load favorites", e);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => { mounted = false; };
//   }, []);

//   if (loading) return <p className="p-4">Loading favorites…</p>;
//   if (!events.length) return <p className="p-4">You have no favorites yet.</p>;

//   const favSet = new Set(events.map(e => e._id || e.id));

//   return (
//     <div className="p-4 space-y-4">
//       <h2 className="text-xl font-semibold">My Favorites</h2>
//       <div className="grid gap-4">
//         {events.map((ev) => {
//           const id = ev._id || ev.id;
//           return (
//             <EventCard
//               key={id}
//               event={{ ...ev, id }} // normalize id so EventCard works
//               isFavorited={favSet.has(id)}
//               onFavoriteChange={(eventId, newVal) => {
//                 // If user un-favorites, remove from list immediately
//                 if (!newVal) {
//                   setEvents((prev) => prev.filter((e) => (e._id || e.id) !== eventId));
//                 }
//               }}
//             />
//           );
//         })}
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import API from "../services/api";
import EventCard from "../components/EventCard";

export default function Favorites() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🩵 Load favorites from backend
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("/events/my/favorites");
      console.log("GET /events/my/favorites ->", res.status, res.data);

      setEvents(res.data?.events || []);
    } catch (err) {
      console.error("Error loading favorites:", err);
      setError("Failed to load favorite events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // ❤️ Remove from list instantly when unfavorited
  const handleFavoriteChange = (eventId, isFav) => {
    if (!isFav) {
      setEvents((prev) => prev.filter((e) => (e._id || e.id) !== eventId));
    }
  };

  // =======================
  // 🧭 RENDER
  // =======================
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 text-lg">
        Loading favorites…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 font-medium">{error}</div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="border rounded-lg bg-white p-6 text-center text-gray-600">
        You have no favorite events yet.
      </div>
    );
  }

  // Normalize IDs for EventCard compatibility
  const favoriteIds = new Set(events.map((e) => e._id || e.id));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">My Favorite Events</h2>

      <div className="space-y-3">
        {events.map((event) => {
          const id = event._id || event.id;

          return (
            <div
              key={id}
              className="border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition"
            >
              {/* ✅ Reuse your nice EventCard component */}
              <EventCard
                event={{ ...event, id }}
                isFavorited={favoriteIds.has(id)}
                onFavoriteChange={handleFavoriteChange}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

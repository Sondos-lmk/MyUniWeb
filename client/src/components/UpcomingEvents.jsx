// // import React, { useEffect, useState } from "react";
// // import API from "../services/api";

// // const UpcomingEvents = () => {
// //   const [events, setEvents] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [searchName, setSearchName] = useState("");
// //   const [type, setType] = useState("");

// //   // Fetch all upcoming events (default)
// //   const fetchEvents = async () => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       const res = await API.get("/events/upcoming", {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       setEvents(res.data.events || []);
// //       setError(null);
// //     } catch (err) {
// //       console.error("Error fetching events:", err);
// //       setError("Failed to load upcoming events.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Search by name/type
// //   const handleSearch = async (e) => {
// //     e.preventDefault();
// //     if (!searchName && !type) {
// //       fetchEvents();
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       const token = localStorage.getItem("token");
// //       const res = await API.get("/events/search", {
// //         params: { name: searchName, type },
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       setEvents(res.data.events || []);
// //       setError(null);
// //     } catch (err) {
// //       console.error("Error searching events:", err);
// //       if (err.response?.status === 404)
// //         setError("No events found matching your search.");
// //       else setError("Failed to search events.");
// //       setEvents([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchEvents();
// //   }, []);

// //   return (
// //     <div className="space-y-4">
// //       <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>

// //       {/* 🔍 Search Bar */}
// //       <form
// //         onSubmit={handleSearch}
// //         className="flex flex-wrap gap-3 mb-4 items-center"
// //       >
// //         <input
// //           type="text"
// //           placeholder="Search by event or professor name..."
// //           value={searchName}
// //           onChange={(e) => setSearchName(e.target.value)}
// //           className="border rounded-lg px-3 py-2 w-60 focus:ring focus:ring-blue-200"
// //         />

// //         <select
// //           value={type}
// //           onChange={(e) => setType(e.target.value)}
// //           className="border rounded-lg px-3 py-2 w-40"
// //         >
// //           <option value="">All Types</option>
// //           <option value="workshop">Workshop</option>
// //           <option value="trip">Trip</option>
// //           <option value="bazaar">Bazaar</option>
// //           <option value="booth">Booth</option>
// //           <option value="conference">Conference</option>
// //         </select>

// //         <button
// //           type="submit"
// //           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
// //         >
// //           Search
// //         </button>

// //         {(searchName || type) && (
// //           <button
// //             type="button"
// //             onClick={() => {
// //               setSearchName("");
// //               setType("");
// //               fetchEvents();
// //             }}
// //             className="text-sm text-gray-600 underline"
// //           >
// //             Clear
// //           </button>
// //         )}
// //       </form>

// //       {/* ⚙️ Loading & Error States */}
// //       {loading && <p>Loading events...</p>}
// //       {error && <p className="text-red-600">{error}</p>}
// //       {!loading && !error && events.length === 0 && (
// //         <p>No upcoming events available.</p>
// //       )}

// //       {/* 📋 Event List */}
// //       <div className="space-y-3">
// //         {events.map((event) => (
// //           <div
// //             key={event.id}
// //             className="border p-4 rounded-lg shadow-sm bg-white"
// //           >
// //             <h3 className="text-lg font-bold">{event.title}</h3>
// //             <p><strong>Type:</strong> {event.type}</p>
// //             <p><strong>Description:</strong> {event.description || "No description"}</p>
// //             <p><strong>Location:</strong> {event.location}</p>
// //             <p><strong>Start:</strong> {new Date(event.startDate).toLocaleString()}</p>
// //             <p><strong>End:</strong> {new Date(event.endDate).toLocaleString()}</p>
// //             <p><strong>Status:</strong> {event.status}</p>
// //             <p><strong>Rating:</strong>{" "}{event.averageRating? `${event.averageRating.toFixed(1)} / 5 ⭐` : "Unrated"}</p>
            
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default UpcomingEvents;
// import React, { useEffect, useState } from "react";
// import API from "../services/api";
// import EventCard from "./EventCard";
// import { getMyFavorites } from "../services/api";
// export default function UpcomingEvents() {
// const [favoriteIds, setFavoriteIds] = useState(new Set());

// const UpcomingEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchName, setSearchName] = useState("");
//   const [type, setType] = useState("");
// const [favoriteIds, setFavoriteIds] = useState(new Set());

//   // Rating popup states
//   const [selectedEventId, setSelectedEventId] = useState(null);
//   const [ratingValue, setRatingValue] = useState(0);
//   const [message, setMessage] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   // Fetch all upcoming events (default)
//   const fetchEvents = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await API.get("/events/upcoming", {

//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setEvents(res.data.events || []);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching events:", err);
//       setError("Failed to load upcoming events.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Search by name/type
//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!searchName && !type) {
//       fetchEvents();
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       const res = await API.get("/events/search", {

//         params: { name: searchName, type },
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setEvents(res.data.events || []);
//       setError(null);
//     } catch (err) {
//       console.error("Error searching events:", err);
//       if (err.response?.status === 404)
//         setError("No events found matching your search.");
//       else setError("Failed to search events.");
//       setEvents([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//   let mounted = true;
//   (async () => {
//     try {
//       const favs = await getMyFavorites();   // returns array of events
//       const ids = new Set(favs.map(e => e._id || e.id));
//       if (mounted) setFavoriteIds(ids);
//     } catch (e) {
//       console.error("Failed to load favorites", e);
//     }
//   })();
//   return () => { mounted = false; };
// }, []);

// useEffect(() => {
//   fetchEvents();
// }, []);


//   // Open rating popup
//   const handleOpenRating = (id) => {
//     setSelectedEventId(id);
//     setRatingValue(0);
//     setMessage("");
//   };

//   // Submit rating
//   const handleRateEvent = async () => {
//     if (!selectedEventId || !ratingValue) return;
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setMessage("Please log in first.");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const res = await fetch(
//         `http://localhost:4000/api/events/${selectedEventId}/rate`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ value: ratingValue }),
//         }
//       );
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       setMessage("✅ Rating submitted!");
//       fetchEvents(); // refresh ratings
//     } catch (err) {
//       setMessage(`❌ ${err.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>

//       {/* 🔍 Search Bar */}
//       <form
//         onSubmit={handleSearch}
//         className="flex flex-wrap gap-3 mb-4 items-center"
//       >
//         <input
//           type="text"
//           placeholder="Search by event or professor name..."
//           value={searchName}
//           onChange={(e) => setSearchName(e.target.value)}
//           className="border rounded-lg px-3 py-2 w-60 focus:ring focus:ring-blue-200"
//         />

//         <select
//           value={type}
//           onChange={(e) => setType(e.target.value)}
//           className="border rounded-lg px-3 py-2 w-40"
//         >
//           <option value="">All Types</option>
//           <option value="workshop">Workshop</option>
//           <option value="trip">Trip</option>
//           <option value="bazaar">Bazaar</option>
//           <option value="booth">Booth</option>
//           <option value="conference">Conference</option>
//         </select>

//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           Search
//         </button>

//         {(searchName || type) && (
//           <button
//             type="button"
//             onClick={() => {
//               setSearchName("");
//               setType("");
//               fetchEvents();
//             }}
//             className="text-sm text-gray-600 underline"
//           >
//             Clear
//           </button>
//         )}
//       </form>

//       {/* ⚙️ Loading & Error States */}
//       {loading && <p>Loading events...</p>}
//       {error && <p className="text-red-600">{error}</p>}
//       {!loading && !error && events.length === 0 && (
//         <p>No upcoming events available.</p>
//       )}

//       {/* 📋 Event List */}
//       <div className="space-y-3">
//         {events.map((event) => {
//           const hasEnded = new Date(event.endDate) < new Date();
//           const canRate = hasEnded;

//           return (
//             <div
//               key={event._id || event.id}
//               className="border p-4 rounded-lg shadow-sm bg-white"
//             >
//               <h3 className="text-lg font-bold">{event.title}</h3>
//               <p>
//                 <strong>Type:</strong> {event.type}
//               </p>
//               <p>
//                 <strong>Description:</strong>{" "}
//                 {event.description || "No description"}
//               </p>
//               <p>
//                 <strong>Location:</strong> {event.location}
//               </p>
//               <p>
//                 <strong>Start:</strong>{" "}
//                 {new Date(event.startDate).toLocaleString()}
//               </p>
//               <p>
//                 <strong>End:</strong>{" "}
//                 {new Date(event.endDate).toLocaleString()}
//               </p>
//               <p>
//                 <strong>Status:</strong> {event.status}
//               </p>
//               <p>
//                 <strong>Rating:</strong>{" "}
//                 {event.averageRating
//                   ? `${event.averageRating.toFixed(1)} / 5 ⭐`
//                   : "Unrated"}
//               </p>

//               {canRate ? (
//                 <button
//                   onClick={() => handleOpenRating(event._id || event.id)}
//                   className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
//                 >
//                   Rate this Event
//                 </button>
//               ) : (
//                 <p className="text-gray-500 text-sm italic mt-2">
//                   You can rate this event after it ends.
//                 </p>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* ⭐ Rating Popup */}
//       {selectedEventId && (
//         <div
//           style={{
//             position: "fixed",
//             top: "0",
//             left: "0",
//             width: "100%",
//             height: "100%",
//             backgroundColor: "rgba(0,0,0,0.6)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             zIndex: "999",
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "white",
//               borderRadius: "10px",
//               padding: "20px",
//               width: "300px",
//               textAlign: "center",
//             }}
//           >
//             <h3>Rate this Event</h3>
//             <p style={{ fontSize: "0.9rem", color: "gray" }}>
//               Only one rating per user is allowed.
//             </p>
//             <div style={{ fontSize: "2rem", margin: "10px 0" }}>
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <span
//                   key={star}
//                   onClick={() => setRatingValue(star)}
//                   style={{
//                     cursor: "pointer",
//                     color: ratingValue >= star ? "#FFD700" : "#ccc",
//                   }}
//                 >
//                   ★
//                 </span>
//               ))}
//             </div>
//             <button
//               onClick={handleRateEvent}
//               disabled={submitting}
//               className="bg-green-600 text-white px-4 py-2 rounded mr-2"
//             >
//               {submitting ? "Submitting..." : "Submit"}
//             </button>
//             <button
//               onClick={() => setSelectedEventId(null)}
//               className="bg-gray-500 text-white px-4 py-2 rounded"
//             >
//               Cancel
//             </button>
//             {message && (
//               <p className="mt-3 text-sm text-gray-700">{message}</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// }
import React, { useEffect, useState } from "react";
import API, { getMyFavorites } from "../services/api";
import EventCard from "./EventCard";

export default function UpcomingEvents() {
  // ---------- State ----------
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [type, setType] = useState("");

  // Favorites: store favorite event ids
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  // Rating popup states
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ---------- Data fetchers ----------
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/events/upcoming");
      setEvents(res.data.events || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
      setError("Failed to load upcoming events.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchName && !type) {
      fetchEvents();
      return;
    }

    try {
      setLoading(true);
      const res = await API.get("/events/search", {
        params: { name: searchName, type },
      });
      setEvents(res.data.events || []);
      setError(null);
    } catch (err) {
      console.error("Error searching events:", err);
      setEvents([]);
      setError(
        err?.response?.status === 404
          ? "No events found matching your search."
          : "Failed to search events."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- Effects ----------
  // Load favorites once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const favs = await getMyFavorites(); // [{_id, ...}]
        const ids = new Set(favs.map((e) => e._id || e.id));
        if (mounted) setFavoriteIds(ids);
      } catch (e) {
        console.error("Failed to load favorites", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load upcoming events
  useEffect(() => {
    fetchEvents();
  }, []);

  // ---------- Rating ----------
  const handleOpenRating = (id) => {
    setSelectedEventId(id);
    setRatingValue(0);
    setMessage("");
  };

  const handleRateEvent = async () => {
    if (!selectedEventId || !ratingValue) return;

    try {
      setSubmitting(true);
      const res = await API.post(`/events/${selectedEventId}/rate`, {
        value: ratingValue,
      });
      if (res.status !== 200) throw new Error(res.data?.message || "Failed");
      setMessage("✅ Rating submitted!");
      await fetchEvents(); // refresh ratings
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to rate event.";
      setMessage(`❌ ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Render ----------
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>

      {/* 🔍 Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-4 items-center">
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

      {/* 📋 Event List (using EventCard with heart) */}
      <div className="space-y-3">
        {events.map((ev) => {
          const id = ev._id || ev.id;
          const hasEnded = ev.endDate ? new Date(ev.endDate) < new Date() : false;
          const canRate = hasEnded;

          return (
            <EventCard
              key={id}
              event={{
                ...ev,
                id, // normalize id for the card
                desc: ev.description ?? ev.desc, // ensure desc works
              }}
              isFavorited={favoriteIds.has(id)}
              onFavoriteChange={(eventId, newVal) => {
                setFavoriteIds((prev) => {
                  const next = new Set(prev);
                  if (newVal) next.add(eventId);
                  else next.delete(eventId);
                  return next;
                });
              }}
              // Put your rate button / message into the "secondary" slot
              secondary={
                canRate ? (
                  <button
                    onClick={() => handleOpenRating(id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Rate this Event
                  </button>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    You can rate this event after it ends.
                  </p>
                )
              }
            />
          );
        })}
      </div>

      {/* ⭐ Rating Popup */}
      {selectedEventId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
              width: 300,
              textAlign: "center",
            }}
          >
            <h3>Rate this Event</h3>
            <p style={{ fontSize: "0.9rem", color: "gray" }}>
              Only one rating per user is allowed.
            </p>
            <div style={{ fontSize: "2rem", margin: "10px 0" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRatingValue(star)}
                  style={{
                    cursor: "pointer",
                    color: ratingValue >= star ? "#FFD700" : "#ccc",
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <button
              onClick={handleRateEvent}
              disabled={submitting}
              className="bg-green-600 text-white px-4 py-2 rounded mr-2"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <button
              onClick={() => setSelectedEventId(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            {message && (
              <p className="mt-3 text-sm text-gray-700">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

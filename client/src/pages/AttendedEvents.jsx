
// import React, { useEffect, useState } from "react";
// import API from "../services/api";

// export default function AttendedEvents() {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // ⭐ Rating popup state
//   const [selectedEventId, setSelectedEventId] = useState(null);
//   const [ratingValue, setRatingValue] = useState(0);
//   const [message, setMessage] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const fetchAttended = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await API.get("/events/attended", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       console.log("GET /events/attended ->", res.status, res.data);

//       // Only finished events
//       const now = new Date();
//       const finished = (res.data?.events || []).filter((ev) => {
//         const end = new Date(ev.endDate || ev.date);
//         return end < now;
//       });

//       setEvents(finished);
//       setError(null);
//     } catch (err) {
//       console.error("Error loading attended events:", err);
//       setError("Failed to load attended events.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAttended();
//   }, []);

//   const handleOpenRating = (id) => {
//     setSelectedEventId(id);
//     setRatingValue(0);
//     setMessage("");
//   };

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
//       await fetchAttended();
//     } catch (err) {
//       setMessage(`❌ ${err.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold mb-2">Attended Events</h2>

//       {/* Loading/Error */}
//       {loading && <p>Loading events...</p>}
//       {error && <p className="text-red-600">{error}</p>}

//       {/* Empty state */}
//       {!loading && !error && events.length === 0 && (
//         <div className="border rounded-lg bg-white p-6 text-center text-gray-600">
//           No attended events yet.
//         </div>
//       )}

//       {/* Event list */}
//       {events.length > 0 && (
//         <div className="space-y-3">
//           {events.map((event) => (
//             <div
//               key={event._id || event.id}
//               className="border p-4 rounded-lg shadow-sm bg-white"
//             >
//               <h3 className="text-lg font-bold">{event.title || event.name}</h3>
//               <p><strong>Type:</strong> {event.type}</p>
//               <p><strong>Description:</strong> {event.description || "No description"}</p>
//               <p><strong>Location:</strong> {event.location}</p>
//               <p><strong>Start:</strong> {new Date(event.startDate || event.date).toLocaleString()}</p>
//               <p><strong>End:</strong> {new Date(event.endDate || event.date).toLocaleString()}</p>
//               <p><strong>Status:</strong> {event.status}</p>
//               <p>
//                 <strong>Rating:</strong>{" "}
//                 {event.averageRating
//                   ? `${Number(event.averageRating).toFixed(1)} / 5 ⭐`
//                   : "Unrated"}
//               </p>

//               <button
//                 onClick={() => handleOpenRating(event._id || event.id)}
//                 className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
//               >
//                 Rate this Event
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Rating modal */}
//       {selectedEventId && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.6)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 50,
//           }}
//         >
//           <div
//             style={{
//               background: "#fff",
//               padding: 20,
//               borderRadius: 10,
//               width: 320,
//               textAlign: "center",
//             }}
//           >
//             <h3>Rate this Event</h3>
//             <p style={{ fontSize: 12, color: "#666" }}>
//               Only one rating per user is allowed.
//             </p>

//             <div style={{ fontSize: "2rem", margin: "10px 0" }}>
//               {[1, 2, 3, 4, 5].map((s) => (
//                 <span
//                   key={s}
//                   onClick={() => setRatingValue(s)}
//                   style={{
//                     cursor: "pointer",
//                     color: ratingValue >= s ? "#FFD700" : "#ccc",
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

//             {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AttendedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ⭐ Rating popup state
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 💬 Comment state (added)
  const [commentOpenFor, setCommentOpenFor] = useState(null); // eventId | null
  const [commentText, setCommentText] = useState("");
  const [commentMsg, setCommentMsg] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchAttended = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/events/attended", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("GET /events/attended ->", res.status, res.data);

      // Only finished events
      const now = new Date();
      const finished = (res.data?.events || []).filter((ev) => {
        const end = new Date(ev.endDate || ev.date);
        return end < now;
      });

      setEvents(finished);
      setError(null);
    } catch (err) {
      console.error("Error loading attended events:", err);
      setError("Failed to load attended events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttended();
  }, []);

  const handleOpenRating = (id) => {
    setSelectedEventId(id);
    setRatingValue(0);
    setMessage("");
  };

  const handleRateEvent = async () => {
    if (!selectedEventId || !ratingValue) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in first.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(
        `http://localhost:4000/api/events/${selectedEventId}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value: ratingValue }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage("✅ Rating submitted!");
      await fetchAttended();
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // 💬 COMMENTS (added)
  // =========================
  const openCommentBox = (eventId) => {
    setCommentOpenFor((prev) => (prev === eventId ? null : eventId));
    setCommentText("");
    setCommentMsg("");
  };

  const submitComment = async (eventId) => {
    if (!commentText.trim()) {
      setCommentMsg("Please write a comment first.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setCommentMsg("Please log in first.");
      return;
    }
    try {
      setSubmittingComment(true);
      const res = await API.post(
        `/events/${eventId}/comment`,
        { text: commentText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status !== 201 && res.status !== 200) {
        throw new Error(res.data?.message || "Failed to add comment.");
      }
      setCommentMsg("✅ Comment added!");
      setCommentText("");
      await fetchAttended(); // refresh to show the new comment
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add comment.";
      setCommentMsg(`❌ ${msg}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Attended Events</h2>

      {/* Loading/Error */}
      {loading && <p>Loading events...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Empty state */}
      {!loading && !error && events.length === 0 && (
        <div className="border rounded-lg bg-white p-6 text-center text-gray-600">
          No attended events yet.
        </div>
      )}

      {/* Event list */}
      {events.length > 0 && (
        <div className="space-y-3">
          {events.map((event) => {
            const id = event._id || event.id;
            const hasAvg =
              event.averageRating !== null &&
              event.averageRating !== undefined &&
              !Number.isNaN(Number(event.averageRating));

            return (
              <div key={id} className="border p-4 rounded-lg shadow-sm bg-white">
                <h3 className="text-lg font-bold">{event.title || event.name}</h3>
                <p><strong>Type:</strong> {event.type}</p>
                <p><strong>Description:</strong> {event.description || "No description"}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Start:</strong> {new Date(event.startDate || event.date).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(event.endDate || event.date).toLocaleString()}</p>
                <p><strong>Status:</strong> {event.status}</p>
                <p>
                  <strong>Rating:</strong>{" "}
                  {hasAvg
                    ? `${Number(event.averageRating).toFixed(1)} / 5 ⭐`
                    : "Unrated"}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleOpenRating(id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Rate this Event
                  </button>

                  <button
                    onClick={() => openCommentBox(id)}
                    className="bg-gray-700 text-white px-3 py-1 rounded"
                  >
                    {commentOpenFor === id ? "Close Comment" : "Add Comment"}
                  </button>
                </div>

                {/* Existing comments */}
                {!!event.comments?.length && (
                  <div className="mt-4 bg-gray-50 border rounded p-3">
                    <p className="font-semibold mb-2">Comments</p>
                    <ul className="space-y-2">
                      {event.comments.map((c) => (
                        <li key={c._id || `${c.user}-${c.createdAt}`}>
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">User</span>
                            <span className="text-gray-500">
                              {" "}
                              • {new Date(c.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="ml-1">{c.text}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Comment input (toggle) */}
                {commentOpenFor === id && (
                  <div className="mt-3">
                    <textarea
                      className="w-full border rounded p-2"
                      rows={3}
                      placeholder="Write your comment…"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => submitComment(id)}
                        disabled={submittingComment}
                        className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-60"
                      >
                        {submittingComment ? "Submitting..." : "Submit Comment"}
                      </button>
                      {commentMsg && (
                        <span className="text-sm text-gray-700">{commentMsg}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rating modal */}
      {selectedEventId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 10,
              width: 320,
              textAlign: "center",
            }}
          >
            <h3>Rate this Event</h3>
            <p style={{ fontSize: 12, color: "#666" }}>
              Only one rating per user is allowed.
            </p>

            <div style={{ fontSize: "2rem", margin: "10px 0" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  onClick={() => setRatingValue(s)}
                  style={{
                    cursor: "pointer",
                    color: ratingValue >= s ? "#FFD700" : "#ccc",
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

            {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// client/src/pages/AttendedEvents.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";

const AttendedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ratingInputs[eventId] = 1..5
  const [ratingInputs, setRatingInputs] = useState({});
  // commentInputs[eventId] = "text"
  const [commentInputs, setCommentInputs] = useState({});
  // submitting[eventId] = true/false for disabling buttons
  const [submitting, setSubmitting] = useState({});

  const fetchAttended = async () => {
    try {
      setLoading(true);
      const res = await API.get("/events/attended");
      // backend returns: { events: [...] }
      setEvents(res.data.events || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching attended events:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load attended events."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttended();
  }, []);

  const handleRate = async (eventId) => {
    const value = Number(ratingInputs[eventId]);
    if (!value || value < 1 || value > 5) {
      alert("Please choose a rating between 1 and 5.");
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, [eventId]: true }));
      const res = await API.post(`/events/${eventId}/rate`, { value });

      const avg = res.data.average;

      // update event rating in state
      setEvents((prev) =>
        prev.map((e) => {
          const id = e._id || e.id;
          if (String(id) !== String(eventId)) return e;
          return {
            ...e,
            rating: avg,
            averageRating: avg,
          };
        })
      );
    } catch (err) {
      console.error("Rate event error:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to submit rating."
      );
    } finally {
      setSubmitting((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const handleComment = async (eventId) => {
    const text = (commentInputs[eventId] || "").trim();
    if (!text) {
      alert("Please write a comment before submitting.");
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, [eventId]: true }));
      const res = await API.post(`/events/${eventId}/comment`, { text });

      const newComment = res.data.comment;

      setEvents((prev) =>
        prev.map((e) => {
          const id = e._id || e.id;
          if (String(id) !== String(eventId)) return e;
          return {
            ...e,
            comments: [...(e.comments || []), newComment],
          };
        })
      );

      // clear textarea
      setCommentInputs((prev) => ({ ...prev, [eventId]: "" }));
    } catch (err) {
      console.error("Add comment error:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to submit comment."
      );
    } finally {
      setSubmitting((prev) => ({ ...prev, [eventId]: false }));
    }
  };
  

  if (loading) {
    return <p>Loading attended events...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!events.length) {
    return (
      <p className="text-gray-600">
        You haven&apos;t attended any events yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-4">
        My Attended Events
      </h2>

      {events.map((event) => {
        const id = event._id || event.id;

        const avg =
          typeof event.averageRating === "number"
            ? event.averageRating
            : event.rating && event.rating !== "unrated"
            ? Number(event.rating)
            : null;

        const isRated =
          event.rating && event.rating !== "unrated" && event.rating != null;

        return (
          <div
            key={id}
            className="border rounded-lg bg-white shadow-sm p-4 space-y-2"
          >
            <h3 className="text-lg font-semibold text-center">
              {event.title}
            </h3>

            <p className="text-sm text-center">
              <span className="font-semibold">Type:</span> {event.type}
            </p>

            <p className="text-sm">
              <span className="font-semibold">Description:</span>{" "}
              {event.desc || event.description || "No description"}
            </p>

            <p className="text-sm">
              <span className="font-semibold">Location:</span>{" "}
              {event.location || "N/A"}
            </p>

            <p className="text-sm">
              <span className="font-semibold">Start:</span>{" "}
              {event.startDate
                ? new Date(event.startDate).toLocaleString()
                : "—"}
            </p>

            <p className="text-sm">
              <span className="font-semibold">End:</span>{" "}
              {event.endDate
                ? new Date(event.endDate).toLocaleString()
                : "—"}
            </p>

            {/* Average rating info */}
            <p className="text-sm mt-1">
              <span className="font-semibold">Average Rating:</span>{" "}
              {avg ? `${avg.toFixed(1)} / 5` : "Unrated"}
            </p>

            {/* Rating UI */}
            <div className="mt-3 border-t pt-3">
              {isRated ? (
                <p className="text-sm text-green-700 font-semibold">
                  You have already rated this event. Thank you!
                </p>
              ) : (
                <>
                  <p className="text-sm mb-1">Rate this event (1–5):</p>
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={ratingInputs[id] || ""}
                      onChange={(e) =>
                        setRatingInputs((prev) => ({
                          ...prev,
                          [id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select</option>
                      <option value="1">1 – Very bad</option>
                      <option value="2">2 – Bad</option>
                      <option value="3">3 – Okay</option>
                      <option value="4">4 – Good</option>
                      <option value="5">5 – Excellent</option>
                    </select>
                    <button
                      onClick={() => handleRate(id)}
                      disabled={submitting[id]}
                      className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting[id] ? "Submitting..." : "Submit Rating"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Comment UI */}
            <div className="mt-3 border-t pt-3">
              <p className="text-sm mb-1">
                Leave a comment about this event:
              </p>
              <textarea
                rows={2}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Write your comment..."
                value={commentInputs[id] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({
                    ...prev,
                    [id]: e.target.value,
                  }))
                }
              />
              <button
                onClick={() => handleComment(id)}
                disabled={submitting[id]}
                className="mt-2 bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {submitting[id] ? "Submitting..." : "Submit Comment"}
              </button>

              {/* Existing comments */}
              {event.comments && event.comments.length > 0 && (
                <div className="mt-2 text-xs text-gray-700">
                  <p className="font-semibold mb-1">Comments:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    {event.comments.map((c) => (
                      <li key={c._id || c.createdAt}>
                        {c.text}{" "}
                        <span className="text-gray-400">
                          ({new Date(c.createdAt).toLocaleString()})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendedEvents;
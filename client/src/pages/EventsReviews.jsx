// client/src/pages/EventsReviews.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";

const EventsReviews = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPastEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/events/");
      const allEvents = res.data.events || res.data || [];
      
      // Filter to only past events (endDate has passed)
      const now = new Date();
      const pastEvents = allEvents.filter((event) => {
        const endDate = event.endDate || event.date;
        if (!endDate) return false;
        return new Date(endDate) < now;
      });

      setEvents(pastEvents);
      setError(null);
    } catch (err) {
      console.error("Error fetching past events:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load past events."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return null;
    const sum = ratings.reduce((acc, r) => acc + (r.value || 0), 0);
    return (sum / ratings.length).toFixed(1);
  };

  if (loading) {
    return <p className="text-center py-8">Loading past events...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-center py-8">{error}</p>;
  }

  if (!events.length) {
    return (
      <p className="text-slate-600 text-center py-8">
        No past events available yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => {
        const id = event._id || event.id;
        const avgRating = calculateAverageRating(event.ratings);

        return (
          <div
            key={id}
            className="border border-slate-200 rounded-xl bg-white shadow-md p-6 space-y-4"
          >
            {/* Event Title */}
            <h3 className="text-2xl font-bold text-slate-800">{event.title}</h3>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-lg">
              <div>
                <span className="font-semibold text-slate-700">Type:</span>{" "}
                <span className="text-slate-600 capitalize">{event.type}</span>
              </div>

              {event.desc && (
                <div className="md:col-span-2">
                  <span className="font-semibold text-slate-700">Description:</span>{" "}
                  <span className="text-slate-600">{event.desc || event.description}</span>
                </div>
              )}

              {/* Gym session specific fields */}
              {event.type === 'gym' ? (
                <>
                  <div>
                    <span className="font-semibold text-slate-700">Date:</span>{" "}
                    <span className="text-slate-600">
                      {event.date ? new Date(event.date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700">Time:</span>{" "}
                    <span className="text-slate-600">{event.time || "N/A"}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700">Duration:</span>{" "}
                    <span className="text-slate-600">
                      {event.duration ? `${event.duration} minutes` : "N/A"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="font-semibold text-slate-700">Location:</span>{" "}
                    <span className="text-slate-600">{event.location || "N/A"}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700">Start:</span>{" "}
                    <span className="text-slate-600">
                      {event.startDate ? new Date(event.startDate).toLocaleString() : "—"}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700">End:</span>{" "}
                    <span className="text-slate-600">
                      {event.endDate ? new Date(event.endDate).toLocaleString() : "—"}
                    </span>
                  </div>
                </>
              )}

              <div>
                <span className="font-semibold text-slate-700">Average Rating:</span>{" "}
                <span className="text-slate-600 font-bold">
                  {avgRating ? `${avgRating} / 5 ⭐` : "Not rated yet"}
                </span>
              </div>
            </div>

            {/* All Ratings and Comments */}
            {(event.ratings?.length > 0 || event.comments?.length > 0) ? (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-800 mb-3">Reviews:</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {event.ratings?.map((rating, idx) => {
                    const matchingComment = event.comments?.find(c => 
                      String(c.user?._id || c.user) === String(rating.user?._id || rating.user)
                    );
                    
                    return (
                      <div key={idx} className="bg-slate-50 p-4 rounded-lg text-sm border border-slate-200">
                        <p className="text-slate-700">
                          <span className="font-semibold text-cyan-700">
                            {rating.user?.name || "Anonymous User"}
                          </span>{" "}
                          rated <span className="font-bold text-amber-600">{rating.value} stars ⭐</span>
                          {matchingComment && (
                            <span className="block mt-2 text-slate-600">
                              💬 <span className="italic">"{matchingComment.text}"</span>
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })}

                  {/* Show comments from users who didn't rate */}
                  {event.comments?.filter(comment => 
                    !event.ratings?.some(rating => 
                      String(rating.user?._id || rating.user) === String(comment.user?._id || comment.user)
                    )
                  ).map((comment, idx) => (
                    <div key={`comment-${idx}`} className="bg-slate-50 p-4 rounded-lg text-sm border border-slate-200">
                      <p className="text-slate-700">
                        <span className="font-semibold text-cyan-700">
                          {comment.user?.name || "Anonymous User"}
                        </span>{" "}
                        commented:
                        <span className="block mt-2 text-slate-600">
                          💬 <span className="italic">"{comment.text}"</span>
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-slate-500 text-sm text-center italic">
                  No reviews yet for this event.
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EventsReviews;

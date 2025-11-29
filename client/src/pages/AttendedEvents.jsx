// // client/src/pages/AttendedEvents.jsx
// import React, { useEffect, useState } from "react";
// import { Heart } from "lucide-react";
// import API from "../services/api";
// import { useAuth } from "../context/AuthContext";
// import { addFavorite, removeFavorite, fetchMyFavorites } from "../services/favorites";

// const AttendedEvents = () => {
//   const { user } = useAuth();
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [favSet, setFavSet] = useState(new Set());
//   const [togglingFavorite, setTogglingFavorite] = useState({});

//   // Store rating and comment inputs for each event
//   const [ratingInputs, setRatingInputs] = useState({});
//   const [commentInputs, setCommentInputs] = useState({});
//   const [submitting, setSubmitting] = useState({});

//   const fetchAttended = async () => {
//     try {
//       setLoading(true);
//       const res = await API.get("/events/attended");
      
//       // Filter to only show events where user has rated or commented, or can rate/comment
//       const attendedEvents = res.data.events || [];
//       setEvents(attendedEvents);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching attended events:", err);
//       setError(
//         err.response?.data?.message ||
//           err.response?.data?.error ||
//           "Failed to load attended events."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAttended();
//     loadFavorites();
//   }, []);

//   const loadFavorites = async () => {
//     try {
//       const favs = await fetchMyFavorites();
//       const ids = favs.map((e) => e._id || e.id);
//       setFavSet(new Set(ids));
//     } catch (err) {
//       console.error("Error loading favorites:", err);
//     }
//   };

//   const handleToggleFavorite = async (eventId) => {
//     if (togglingFavorite[eventId]) return;
    
//     setTogglingFavorite((prev) => ({ ...prev, [eventId]: true }));
//     try {
//       const isFavorite = favSet.has(eventId);
//       if (isFavorite) {
//         await removeFavorite(eventId);
//         setFavSet((prev) => {
//           const s = new Set(prev);
//           s.delete(eventId);
//           return s;
//         });
//       } else {
//         await addFavorite(eventId);
//         setFavSet((prev) => new Set(prev).add(eventId));
//       }
//     } catch (err) {
//       console.error("Error toggling favorite:", err);
//       alert(err.response?.data?.message || "Failed to update favorites");
//     } finally {
//       setTogglingFavorite((prev) => ({ ...prev, [eventId]: false }));
//     }
//   };

//   const handleSubmitReview = async (eventId) => {
//     const rating = Number(ratingInputs[eventId]);
//     const comment = (commentInputs[eventId] || "").trim();

//     // Validation
//     if (!rating || rating < 1 || rating > 5) {
//       alert("Please select a rating between 1 and 5.");
//       return;
//     }

//     if (!comment) {
//       alert("Please write a comment before submitting your review.");
//       return;
//     }

//     try {
//       setSubmitting((prev) => ({ ...prev, [eventId]: true }));

//       // Submit both rating and comment
//       await API.post(`/events/${eventId}/rate`, { value: rating });
//       await API.post(`/events/${eventId}/comment`, { text: comment });

//       // Refresh events to get updated data
//       await fetchAttended();
      
//       // Clear inputs
//       setRatingInputs((prev) => ({ ...prev, [eventId]: "" }));
//       setCommentInputs((prev) => ({ ...prev, [eventId]: "" }));
      
//       alert("Review submitted successfully!");
//     } catch (err) {
//       console.error("Submit review error:", err);
//       alert(
//         err.response?.data?.message ||
//           err.response?.data?.error ||
//           "Failed to submit review."
//       );
//     } finally {
//       setSubmitting((prev) => ({ ...prev, [eventId]: false }));
//     }
//   };

//   const calculateAverageRating = (ratings) => {
//     if (!ratings || ratings.length === 0) return null;
//     const sum = ratings.reduce((acc, r) => acc + (r.value || 0), 0);
//     return (sum / ratings.length).toFixed(1);
//   };

//   const hasUserRated = (ratings) => {
//     if (!ratings || !user) return false;
//     return ratings.some(r => String(r.user?._id || r.user) === String(user.id || user._id));
//   };

//   const hasUserCommented = (comments) => {
//     if (!comments || !user) return false;
//     return comments.some(c => String(c.user?._id || c.user) === String(user.id || user._id));
//   };

//   const getUserRating = (ratings) => {
//     if (!ratings || !user) return null;
//     const userRating = ratings.find(r => String(r.user?._id || r.user) === String(user.id || user._id));
//     return userRating?.value || null;
//   };

//   const getUserComment = (comments) => {
//     if (!comments || !user) return null;
//     return comments.find(c => String(c.user?._id || c.user) === String(user.id || user._id));
//   };

//   if (loading) {
//     return <p className="text-center py-8">Loading attended events...</p>;
//   }

//   if (error) {
//     return <p className="text-red-600 text-center py-8">{error}</p>;
//   }

//   if (!events.length) {
//     return (
//       <p className="text-slate-600 text-center py-8">
//         You haven't attended any events yet.
//       </p>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {events.map((event) => {
//         const id = event._id || event.id;
//         const userHasRated = hasUserRated(event.ratings);
//         const userHasCommented = hasUserCommented(event.comments);
//         const userRating = getUserRating(event.ratings);
//         const userComment = getUserComment(event.comments);
//         const isFavorite = favSet.has(id);

//         return (
//           <div
//             key={id}
//             className="relative border border-slate-200 rounded-xl bg-white shadow-md p-6 space-y-4"
//           >
//             {/* Heart Button */}
//             <button
//               onClick={() => handleToggleFavorite(id)}
//               disabled={togglingFavorite[id]}
//               className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all disabled:opacity-50"
//               title={isFavorite ? "Remove from favorites" : "Add to favorites"}
//             >
//               <Heart 
//                 size={20} 
//                 className={`${
//                   isFavorite 
//                     ? "fill-red-500 text-red-500" 
//                     : "text-slate-400 hover:text-red-500"
//                 } transition-colors`}
//               />
//             </button>

//             {/* Event Title */}
//             <h3 className="text-2xl font-bold text-slate-800 pr-12">{event.title}</h3>

//             {/* Event Details */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-lg">
//               <div>
//                 <span className="font-semibold text-slate-700">Type:</span>{" "}
//                 <span className="text-slate-600 capitalize">{event.type}</span>
//               </div>

//               {event.desc && (
//                 <div className="md:col-span-2">
//                   <span className="font-semibold text-slate-700">Description:</span>{" "}
//                   <span className="text-slate-600">{event.desc || event.description}</span>
//                 </div>
//               )}

//               {/* Gym session specific fields */}
//               {event.type === 'gym' ? (
//                 <>
//                   <div>
//                     <span className="font-semibold text-slate-700">Date:</span>{" "}
//                     <span className="text-slate-600">
//                       {event.date ? new Date(event.date).toLocaleDateString() : "N/A"}
//                     </span>
//                   </div>

//                   <div>
//                     <span className="font-semibold text-slate-700">Time:</span>{" "}
//                     <span className="text-slate-600">{event.time || "N/A"}</span>
//                   </div>

//                   <div>
//                     <span className="font-semibold text-slate-700">Duration:</span>{" "}
//                     <span className="text-slate-600">
//                       {event.duration ? `${event.duration} minutes` : "N/A"}
//                     </span>
//                   </div>

//                   <div>
//                     <span className="font-semibold text-slate-700">Capacity:</span>{" "}
//                     <span className="text-slate-600">{event.maxParticipants || "N/A"}</span>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div>
//                     <span className="font-semibold text-slate-700">Location:</span>{" "}
//                     <span className="text-slate-600">{event.location || "N/A"}</span>
//                   </div>

//                   <div>
//                     <span className="font-semibold text-slate-700">Start:</span>{" "}
//                     <span className="text-slate-600">
//                       {event.startDate ? new Date(event.startDate).toLocaleString() : "—"}
//                     </span>
//                   </div>

//                   <div>
//                     <span className="font-semibold text-slate-700">End:</span>{" "}
//                     <span className="text-slate-600">
//                       {event.endDate ? new Date(event.endDate).toLocaleString() : "—"}
//                     </span>
//                   </div>
//                 </>
//               )}
//             </div>

//             {/* User's Rating and Comment Section */}
//             <div className="border-t border-slate-200 pt-4">
//               {userHasRated || userHasCommented ? (
//                 <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
//                   <h4 className="font-semibold text-green-900 mb-2">Your Review:</h4>
//                   {userHasRated && (
//                     <p className="text-sm text-green-800">
//                       <span className="font-semibold">Your rating:</span> {userRating} stars ⭐
//                     </p>
//                   )}
//                   {userComment ? (
//                     <>
//                       <p className="text-sm text-green-800 mt-1">
//                         <span className="font-semibold">Your comment:</span> "{userComment.text}"
//                       </p>
//                       <p className="text-xs text-green-700 mt-2">
//                         Thank you for your feedback! View all reviews in the Events Reviews tab.
//                       </p>
//                     </>
//                   ) : userHasRated ? (
//                     <p className="text-sm text-red-600 mt-1 italic">
//                       Your comment was removed
//                     </p>
//                   ) : (
//                     <p className="text-xs text-green-700 mt-2">
//                       Complete your review to see it in the Events Reviews tab.
//                     </p>
//                   )}
//                 </div>
//               ) : (
//                 <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-4">
//                   <h4 className="font-semibold text-blue-900">Leave Your Review:</h4>
                  
//                   {/* Rating Input */}
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       Your rating (1-5 stars): <span className="text-red-600">*</span>
//                     </label>
//                     <select
//                       className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full"
//                       value={ratingInputs[id] || ""}
//                       onChange={(e) =>
//                         setRatingInputs((prev) => ({
//                           ...prev,
//                           [id]: e.target.value,
//                         }))
//                       }
//                     >
//                       <option value="">Select rating</option>
//                       <option value="1">1 - Poor</option>
//                       <option value="2">2 - Fair</option>
//                       <option value="3">3 - Good</option>
//                       <option value="4">4 - Very Good</option>
//                       <option value="5">5 - Excellent</option>
//                     </select>
//                   </div>

//                   {/* Comment Input */}
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       Your comment: <span className="text-red-600">*</span>
//                     </label>
//                     <textarea
//                       rows={3}
//                       className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
//                       placeholder="Share your thoughts about this event..."
//                       value={commentInputs[id] || ""}
//                       onChange={(e) =>
//                         setCommentInputs((prev) => ({
//                           ...prev,
//                           [id]: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>

//                   {/* Single Submit Review Button */}
//                   <button
//                     onClick={() => handleSubmitReview(id)}
//                     disabled={submitting[id]}
//                     className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-sm px-4 py-3 rounded-lg hover:from-cyan-700 hover:to-blue-800 disabled:opacity-50 font-semibold"
//                   >
//                     {submitting[id] ? "Submitting..." : "Submit Review"}
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default AttendedEvents;
// client/src/pages/AttendedEvents.jsx
import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { addFavorite, removeFavorite, fetchMyFavorites } from "../services/favorites";

const AttendedEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favSet, setFavSet] = useState(new Set());
  const [togglingFavorite, setTogglingFavorite] = useState({});

  // Store rating and comment inputs for each event
  const [ratingInputs, setRatingInputs] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [submitting, setSubmitting] = useState({});

  const fetchAttended = async () => {
    try {
      setLoading(true);
      const res = await API.get("/events/attended");
      
      // Filter to only show events where user has rated or commented, or can rate/comment
      const attendedEvents = res.data.events || [];
      setEvents(attendedEvents);
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
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favs = await fetchMyFavorites();
      const ids = favs.map((e) => e._id || e.id);
      setFavSet(new Set(ids));
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  };

  const handleToggleFavorite = async (eventId) => {
    if (togglingFavorite[eventId]) return;
    
    setTogglingFavorite((prev) => ({ ...prev, [eventId]: true }));
    try {
      const isFavorite = favSet.has(eventId);
      if (isFavorite) {
        await removeFavorite(eventId);
        setFavSet((prev) => {
          const s = new Set(prev);
          s.delete(eventId);
          return s;
        });
      } else {
        await addFavorite(eventId);
        setFavSet((prev) => new Set(prev).add(eventId));
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      alert(err.response?.data?.message || "Failed to update favorites");
    } finally {
      setTogglingFavorite((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const handleSubmitReview = async (eventId) => {
    const rating = Number(ratingInputs[eventId]);
    const comment = (commentInputs[eventId] || "").trim();

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5.");
      return;
    }

    if (!comment) {
      alert("Please write a comment before submitting your review.");
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, [eventId]: true }));

      // Submit both rating and comment
      await API.post(`/events/${eventId}/rate`, { value: rating });
      await API.post(`/events/${eventId}/comment`, { text: comment });

      // Refresh events to get updated data
      await fetchAttended();
      
      // Clear inputs
      setRatingInputs((prev) => ({ ...prev, [eventId]: "" }));
      setCommentInputs((prev) => ({ ...prev, [eventId]: "" }));
      
      alert("Review submitted successfully!");
    } catch (err) {
      console.error("Submit review error:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to submit review."
      );
    } finally {
      setSubmitting((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return null;
    const sum = ratings.reduce((acc, r) => acc + (r.value || 0), 0);
    return (sum / ratings.length).toFixed(1);
  };

  const hasUserRated = (ratings) => {
    if (!ratings || !user) return false;
    return ratings.some(r => String(r.user?._id || r.user) === String(user.id || user._id));
  };

  const hasUserCommented = (comments) => {
    if (!comments || !user) return false;
    return comments.some(c => String(c.user?._id || c.user) === String(user.id || user._id));
  };

  const getUserRating = (ratings) => {
    if (!ratings || !user) return null;
    const userRating = ratings.find(r => String(r.user?._id || r.user) === String(user.id || user._id));
    return userRating?.value || null;
  };

  const getUserComment = (comments) => {
    if (!comments || !user) return null;
    return comments.find(c => String(c.user?._id || c.user) === String(user.id || user._id));
  };

  if (loading) {
    return <p className="text-center py-8">Loading attended events...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-center py-8">{error}</p>;
  }

  if (!events.length) {
    return (
      <p className="text-slate-600 text-center py-8">
        You haven't attended any events yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => {
        const id = event._id || event.id;
        const userHasRated = hasUserRated(event.ratings);
        const userHasCommented = hasUserCommented(event.comments);
        const userRating = getUserRating(event.ratings);
        const userComment = getUserComment(event.comments);
        const isFavorite = favSet.has(id);

        return (
          <div
            key={id}
            className="relative border border-slate-200 rounded-xl bg-white shadow-md p-6 space-y-4"
          >
            {/* Heart Button */}
            <button
              onClick={() => handleToggleFavorite(id)}
              disabled={togglingFavorite[id]}
              className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all disabled:opacity-50"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                size={20} 
                className={`${
                  isFavorite 
                    ? "fill-red-500 text-red-500" 
                    : "text-slate-400 hover:text-red-500"
                } transition-colors`}
              />
            </button>

            {/* Event Title */}
            <h3 className="text-2xl font-bold text-slate-800 pr-12">{event.title}</h3>

            {/* Event Details */}
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

                  <div>
                    <span className="font-semibold text-slate-700">Capacity:</span>{" "}
                    <span className="text-slate-600">{event.maxParticipants || "N/A"}</span>
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
            </div>

            {/* User's Rating and Comment Section */}
            <div className="border-t border-slate-200 pt-4">
              {userHasRated || userHasCommented ? (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Your Review:</h4>
                  {userHasRated && (
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Your rating:</span> {userRating} stars ⭐
                    </p>
                  )}
                  {userComment ? (
                    <>
                      <p className="text-sm text-green-800 mt-1">
                        <span className="font-semibold">Your comment:</span> "{userComment.text}"
                      </p>
                      <p className="text-xs text-green-700 mt-2">
                        Thank you for your feedback! View all reviews in the Events Reviews tab.
                      </p>
                    </>
                  ) : userHasRated ? (
                    <p className="text-sm text-red-600 mt-1 italic">
                      Your comment was removed
                    </p>
                  ) : (
                    <p className="text-xs text-green-700 mt-2">
                      Complete your review to see it in the Events Reviews tab.
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-4">
                  <h4 className="font-semibold text-blue-900">Leave Your Review:</h4>
                  
                  {/* Rating Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Your rating (1-5 stars): <span className="text-red-600">*</span>
                    </label>
                    <select
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full"
                      value={ratingInputs[id] || ""}
                      onChange={(e) =>
                        setRatingInputs((prev) => ({
                          ...prev,
                          [id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select rating</option>
                      <option value="1">1 - Poor</option>
                      <option value="2">2 - Fair</option>
                      <option value="3">3 - Good</option>
                      <option value="4">4 - Very Good</option>
                      <option value="5">5 - Excellent</option>
                    </select>
                  </div>

                  {/* Comment Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Your comment: <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Share your thoughts about this event..."
                      value={commentInputs[id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [id]: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Single Submit Review Button */}
                  <button
                    onClick={() => handleSubmitReview(id)}
                    disabled={submitting[id]}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-sm px-4 py-3 rounded-lg hover:from-cyan-700 hover:to-blue-800 disabled:opacity-50 font-semibold"
                  >
                    {submitting[id] ? "Submitting..." : "Submit Review"}
                  </button>
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

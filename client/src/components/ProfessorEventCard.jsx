import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Calendar, Heart } from "lucide-react";
import API from "../services/api";
import { addFavorite, removeFavorite } from "../services/favorites";
import ModernAlert from "./ui/ModernAlert";

const badgeColor = (type) => {
  switch (type) {
    case "trip":
      return "bg-blue-100 text-blue-700";
    case "bazaar":
      return "bg-amber-100 text-amber-700";
    case "conference":
      return "bg-emerald-100 text-emerald-700";
    case "workshop":
      return "bg-purple-100 text-purple-700";
    case "gym":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const fmt = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const normalizeLocation = (event) =>
  event.location || event.locationInPlatform || event.sessionType || "—";

export default function ProfessorEventCard({
  event,
  currentUser,
  onRegister,
  isFavoritesView,
  userRole,
  isFavorite,
  onToggleFavorite,
}) {
  const navigate = useNavigate();
  const eventId = event?._id || event?.id;
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsTab, setDetailsTab] = useState("details");
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [showVendorsModal, setShowVendorsModal] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regId, setRegId] = useState("");

  // Feedback form state
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);

  // ⭐ Favorites state
  const [isFav, setIsFav] = useState(!!isFavorite);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  useEffect(() => {
    setIsFav(!!isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async () => {
    if (!eventId || togglingFavorite) return;

    setTogglingFavorite(true);
    try {
      if (isFav) {
        await removeFavorite(eventId);
        setIsFav(false);
        onToggleFavorite?.(eventId, false, event);
      } else {
        await addFavorite(eventId);
        setIsFav(true);
        onToggleFavorite?.(eventId, true, event);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      showAlert(err.response?.data?.message || "Failed to update favorites", "error");
    } finally {
      setTogglingFavorite(false);
    }
  };

  // Fetch vendors for bazaar events when modal opens
  const handleShowVendors = async () => {
    setShowVendorsModal(true);
    if (vendors.length === 0) {
      setLoadingVendors(true);
      try {
        const response = await API.get(`/events/${eventId}`);
        const allVendors = response.data.registeredVendors || [];
        // Filter to only show approved and paid vendors
        const approvedPaidVendors = allVendors.filter(
          (v) => v.status === "approved" && v.paymentStatus === "paid"
        );
        setVendors(approvedPaidVendors);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      } finally {
        setLoadingVendors(false);
      }
    }
  };

  // Check if user is already registered (check both attendees and registeredUsers)
  const isRegistered =
    event?.attendees?.some(
      (att) =>
        String(att._id || att) ===
        String(currentUser?.id || currentUser?._id)
    ) ||
    event?.registeredUsers?.some(
      (userId) =>
        String(userId._id || userId) ===
        String(currentUser?.id || currentUser?._id)
    );

  // Check if user is on the waitlist
  const isWaitlisted = event?.waitlist?.some(
    (entry) =>
      String(entry.user?._id || entry.user) ===
      String(currentUser?.id || currentUser?._id)
  );

  // Only show register button for workshops and trips
  const canRegister = event.type === "workshop" || event.type === "trip";

  // Check if event is full
  const maxParticipants = event.maxParticipants || event.capacity || 0;
  const currentRegistrations = event.registeredUsers?.length || 0;
  const isFull = maxParticipants > 0 && currentRegistrations >= maxParticipants;

  // Debug gym session data
  if (event.type === "gym") {
    console.log("Gym session data:", {
      title: event.title,
      date: event.date,
      time: event.time,
      duration: event.duration,
      sessionType: event.sessionType,
      maxParticipants: event.maxParticipants,
    });
  }

  // Check if registration is still allowed
  const now = new Date();
  const registrationDeadline = event.registrationDeadline
    ? new Date(event.registrationDeadline)
    : null;
  const eventStartDate = event.startDate
    ? new Date(event.startDate)
    : event.date
    ? new Date(event.date)
    : null;
  const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate;

  const isDeadlinePassed = registrationDeadline && now > registrationDeadline;
  const isEventPassed = eventStartDate && now > eventStartDate;
  const isEventEnded = eventEndDate && now > eventEndDate;

  let registrationStatus = "available";
  let registrationMessage = "Register";

  if (isRegistered) {
    registrationStatus = "registered";
    registrationMessage = "Registered";
  } else if (isWaitlisted) {
    registrationStatus = "waitlisted";
    registrationMessage = "Waitlisted";
  } else if (isEventPassed) {
    registrationStatus = "eventPassed";
    registrationMessage = "Event Passed";
  } else if (isDeadlinePassed) {
    registrationStatus = "deadlinePassed";
    registrationMessage = "Deadline Passed";
  } else if (isFull) {
    registrationStatus = "full";
    registrationMessage = "Join Waitlist";
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regId.trim()) {
      showAlert("Please fill in name, email, and ID", "error");
      return;
    }

    setRegistering(true);
    try {
      // If event is full, join waitlist instead
      if (isFull) {
        await API.post(`/payment/join-waitlist`, {
          eventId: eventId,
        });
        showAlert("Successfully joined the waitlist! You'll be notified when a spot opens.", "success");
      } else {
        // Regular registration
        await API.post(`/events/register/${eventId}`, {
          name: regName,
          email: regEmail,
          id: regId,
        });
        showAlert("Successfully registered for the event!", "success");
      }
      setShowRegisterModal(false);
      setRegName("");
      setRegEmail("");
      setRegId("");
      onRegister?.();
    } catch (err) {
      console.error("Registration error", err);
      showAlert(err.response?.data?.message || "Failed to register", "error");
    } finally {
      setRegistering(false);
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      showAlert("Please write your feedback", "error");
      return;
    }

    try {
      await API.post(`/events/${eventId}/feedback`, {
        comment: feedback,
        rating: rating,
      });
      showAlert("Feedback submitted successfully!", "success");
      setShowFeedbackModal(false);
      setFeedback("");
      setRating(5);
    } catch (err) {
      console.error("Error submitting feedback", err);
      showAlert(err.response?.data?.message || "Failed to submit feedback", "error");
    }
  };

  const handleViewDetails = async () => {
    setShowDetailsModal(true);
    setDetailsTab("details");

    if (event.type === "bazaar") {
      try {
        const response = await API.get(`/events/${eventId}`);
        const allVendors = response.data.registeredVendors || [];
        // Filter to only show approved and paid vendors
        const approvedPaidVendors = allVendors.filter(
          (v) => v.status === "approved" && v.paymentStatus === "paid"
        );
        setVendors(approvedPaidVendors);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      }
    }
  };

  return (
    <>
      <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-0.5 overflow-hidden h-full flex flex-col">
        <div className="p-5 flex flex-col h-full">
          {/* HEADER: title on left, type badge + heart on right */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold break-words">
              {event.title}
            </h3>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${badgeColor(
                  event.type
                )}`}
              >
                {event.type || "event"}
              </span>

              {/* ❤️ Heart directly under type */}
              <button
                onClick={handleToggleFavorite}
                disabled={togglingFavorite}
                className="p-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all disabled:opacity-50"
                title={isFav ? "Remove from favorites" : "Add to favorites"}
                aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  size={18}
                  className={`${
                    isFav
                      ? "fill-red-500 text-red-500"
                      : "text-slate-400 hover:text-red-500"
                  } transition-colors`}
                />
              </button>
            </div>
          </div>

          {event.desc && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {event.desc}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            {/* For gym sessions, show date, time, and duration */}
            {event.type === "gym" ? (
              <>
                <div>
                  <div className="text-slate-500">Date</div>
                  <div className="font-medium text-xs">
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500">Time</div>
                  <div className="font-medium">{event.time || "N/A"}</div>
                </div>

                <div>
                  <div className="text-slate-500">Duration</div>
                  <div className="font-medium">
                    {event.duration ? `${event.duration} min` : "N/A"}
                  </div>
                </div>

                {(event.location ||
                  event.locationInPlatform ||
                  event.sessionType) && (
                  <div>
                    <div className="text-slate-500">Location</div>
                    <div className="font-medium">{normalizeLocation(event)}</div>
                  </div>
                )}

                {event.maxParticipants && (
                  <div>
                    <div className="text-slate-500">Max Participants</div>
                    <div className="font-medium">{event.maxParticipants}</div>
                  </div>
                )}
              </>
            ) : (
              <>
                {(event.location ||
                  event.locationInPlatform ||
                  event.sessionType) && (
                  <div>
                    <div className="text-slate-500">Location</div>
                    <div className="font-medium">{normalizeLocation(event)}</div>
                  </div>
                )}

                {(event.startDate || event.date) && (
                  <div>
                    <div className="text-slate-500">Start</div>
                    <div className="font-medium text-xs">
                      {fmt(event.startDate || event.date)}
                    </div>
                  </div>
                )}

                {event.endDate && (
                  <div>
                    <div className="text-slate-500">End</div>
                    <div className="font-medium text-xs">
                      {fmt(event.endDate)}
                    </div>
                  </div>
                )}

                {event.registrationDeadline && (
                  <div>
                    <div className="text-slate-500">
                      Registration Deadline
                    </div>
                    <div className="font-medium text-xs">
                      {fmt(event.registrationDeadline)}
                    </div>
                  </div>
                )}
              </>
            )}

            {event.capacity && (
              <div>
                <div className="text-slate-500">Capacity</div>
                <div className="font-medium">{event.capacity}</div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-auto pt-4 flex gap-2 flex-wrap">
            {/* Vendors Participating button - show for bazaar events only, hide in favorites view */}
            {!isFavoritesView && event.type === "bazaar" && (
              <button
                onClick={handleShowVendors}
                className="flex-1 min-w-[140px] px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium"
              >
                Vendors Participating
              </button>
            )}

            {/* Feedback button - only show for events that have ended and not in favorites view */}
            {!isFavoritesView && isEventEnded && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="flex-1 min-w-[140px] px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Feedback
              </button>
            )}

            {/* Register button - show for workshops and trips, hide in favorites view */}
            {!isFavoritesView && canRegister && (
              <button
                onClick={() =>
                  (registrationStatus === "available" || registrationStatus === "full") &&
                  setShowRegisterModal(true)
                }
                disabled={registrationStatus !== "available" && registrationStatus !== "full"}
                className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                  registrationStatus === "registered"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : registrationStatus === "waitlisted"
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : registrationStatus === "deadlinePassed" ||
                      registrationStatus === "eventPassed"
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : registrationStatus === "full"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                title={
                  registrationStatus === "eventPassed"
                    ? "Event has already started"
                    : registrationStatus === "deadlinePassed"
                    ? "Registration deadline has passed"
                    : registrationStatus === "registered"
                    ? "You are already registered"
                    : registrationStatus === "waitlisted"
                    ? "You are on the waitlist - you'll be notified when a spot opens"
                    : registrationStatus === "full"
                    ? "Event is full - Click to join waitlist"
                    : "Click to register for this event"
                }
              >
                <Calendar className="w-4 h-4" />
                {registrationMessage}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRegisterModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              {isFull ? `Join Waitlist for ${event.title}` : `Register for ${event.title}`}
            </h2>
            {isFull && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                ⚠️ This event is currently full. You'll be added to the waitlist and notified when a spot opens.
              </div>
            )}
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">ID</label>
                <input
                  type="text"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="Enter your ID"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className={`flex-1 px-4 py-2 text-white rounded-lg disabled:bg-gray-400 ${
                    isFull ? "bg-green-600 hover:bg-green-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {registering ? (isFull ? "Joining..." : "Registering...") : (isFull ? "Join Waitlist" : "Register")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Leave Feedback</h2>
            <form onSubmit={handleFeedback}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Below Average</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Comment
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 min-h-[100px]"
                  placeholder="Share your thoughts..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* More Details Modal */}
      {showDetailsModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{event.title}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 mb-4">
              <button
                onClick={() => setDetailsTab("details")}
                className={`px-4 py-2 font-medium transition-colors ${
                  detailsTab === "details"
                    ? "text-cyan-600 border-b-2 border-cyan-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                More Details
              </button>
              {event.type === "bazaar" && (
                <button
                  onClick={() => setDetailsTab("vendors")}
                  className={`px-4 py-2 font-medium transition-colors ${
                    detailsTab === "vendors"
                      ? "text-cyan-600 border-b-2 border-cyan-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Vendors Participating
                </button>
              )}
            </div>

            {/* Tab Content */}
            {detailsTab === "details" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor(
                      event.type
                    )}`}
                  >
                    {event.type}
                  </span>
                  {event.status && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                      {event.status}
                    </span>
                  )}
                </div>

                {event.desc && (
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-1">
                      Description
                    </h3>
                    <p className="text-slate-600">{event.desc}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {normalizeLocation(event) !== "—" && (
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-1">
                        Location
                      </h3>
                      <p className="text-slate-600">
                        {normalizeLocation(event)}
                      </p>
                    </div>
                  )}

                  {event.capacity && (
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-1">
                        Capacity
                      </h3>
                      <p className="text-slate-600">{event.capacity}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-1">
                      Start Date
                    </h3>
                    <p className="text-slate-600">
                      {fmt(event.startDate || event.date)}
                    </p>
                  </div>

                  {event.endDate && (
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-1">
                        End Date
                      </h3>
                      <p className="text-slate-600">{fmt(event.endDate)}</p>
                    </div>
                  )}

                  {event.registrationDeadline && (
                    <div className="col-span-2">
                      <h3 className="font-semibold text-slate-700 mb-1">
                        Registration Deadline
                      </h3>
                      <p className="text-slate-600">
                        {fmt(event.registrationDeadline)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {detailsTab === "vendors" && event.type === "bazaar" && (
              <div className="space-y-3">
                {vendors.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    No vendors registered yet
                  </p>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-700 mb-3">
                      Participating Vendors
                    </h3>
                    <ul className="space-y-3">
                      {vendors.map((vendorReg, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-cyan-600 rounded-full mt-1.5 flex-shrink-0"></span>
                          <div>
                            <div className="text-slate-700 font-medium">
                              {vendorReg.vendor?.companyName ||
                                vendorReg.companyName ||
                                "Company"}
                            </div>
                            {vendorReg.vendor?.email && (
                              <div className="text-sm text-slate-500">
                                {vendorReg.vendor.email}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Modal */}
      {showVendorsModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowVendorsModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Vendors Participating
              </h2>

              {loadingVendors ? (
                <p className="text-center text-slate-600 py-8">
                  Loading vendors...
                </p>
              ) : vendors.length === 0 ? (
                <p className="text-center text-slate-600 py-8">
                  No vendors registered yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {vendors.map((vendorReg, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                    >
                      <div className="font-semibold text-slate-800 mb-1">
                        {vendorReg.vendor?.companyName ||
                          vendorReg.companyName ||
                          "N/A"}
                      </div>
                      <div className="text-sm text-slate-600">
                        {vendorReg.vendor?.email ||
                          vendorReg.email ||
                          "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowVendorsModal(false)}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Alert */}
      <ModernAlert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />
    </>
  );
}

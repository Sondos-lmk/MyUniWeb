// client/src/components/eventOfficer/EventOfficerEventCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { saveAs } from "file-saver";
import { MoreVertical } from "lucide-react";
import { fetchEventFeedback } from "../services/feedback";

const badgeColor = (type) => {
  switch (type) {
    case "trip": return "bg-blue-100 text-blue-700";
    case "bazaar": return "bg-amber-100 text-amber-700";
    case "conference": return "bg-emerald-100 text-emerald-700";
    case "workshop": return "bg-purple-100 text-purple-700";
    default: return "bg-slate-100 text-slate-700";
  }
};

export default function EventOfficerEventCard({ event, onEdit, onGenerateQr }) {
  const navigate = useNavigate();
  const eventId = event?._id;

  const [menuOpen, setMenuOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ ratings: [], comments: [] });
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");

  const handleViewFeedback = async () => {
    setShowFeedback(true);
    setLoadingFeedback(true);
    try {
      const data = await fetchEventFeedback(eventId);
      setFeedback(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleExportRegistrations = async () => {
    try {
      const res = await API.get(`/events/${eventId}/export-registrations`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `${event.title.replace(/\s+/g, "_")}_registrations.xlsx`);
    } catch (err) {
      console.error("Export error:", err);
      alert("Something went wrong");
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await API.delete(`/events/${eventId}`);
      alert("Event deleted successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Cannot delete event. It may have registered users.");
    }
  };

  const actionButtons = [];

  if (event.type === "bazaar") {
    actionButtons.push(
      { label: "Edit Event", func: () => onEdit(eventId) },
      { label: "Export Registrations", func: handleExportRegistrations },
      { label: "Generate QR Code", func: () => onGenerateQr(eventId) },
      { label: "Delete Event", func: handleDeleteEvent }
    );
  }

  if (event.type === "conference") {
    actionButtons.push(
      { label: "Edit Event", func: () => onEdit(eventId) },
      { label: "Delete Event", func: handleDeleteEvent }
    );
  }

  if (event.type === "workshop") {
    actionButtons.push(
      { label: "Export Registrations", func: handleExportRegistrations },
      { label: "Delete Event", func: handleDeleteEvent }
    );
  }

  if (event.type === "trip") {
    actionButtons.push(
      { label: "Edit Event", func: () => onEdit(eventId) },
      { label: "Export Registrations", func: handleExportRegistrations },
      { label: "Delete Event", func: handleDeleteEvent }
    );
  }

  return (
    <div className="relative group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-0.5 overflow-hidden h-full flex flex-col">

      {/* ⋮ MENU BUTTON */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {menuOpen && (
        <div className="absolute top-12 right-3 bg-white shadow-lg rounded-xl border w-48 z-50 py-2">
          {actionButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => {
                btn.func();
                setMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium mr-8 ${badgeColor(event.type)}`}>
            {event.type}
          </span>
        </div>

        {event.desc && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{event.desc}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          {event.location && (
            <div>
              <div className="text-slate-500">Location</div>
              <div className="font-medium">{event.location}</div>
            </div>
          )}

          <div>
            <div className="text-slate-500">Start</div>
            <div className="font-medium">{fmt(event.startDate)}</div>
          </div>
          <div>
            <div className="text-slate-500">End</div>
            <div className="font-medium">{fmt(event.endDate)}</div>
          </div>

          {event.registrationDeadline && (
            <div className="col-span-2">
              <div className="text-slate-500">Registration Deadline</div>
              <div className="font-medium">{fmt(event.registrationDeadline)}</div>
            </div>
          )}
        </div>

        {/* MAIN BUTTONS */}
        <div className="mt-auto pt-5 flex items-center gap-3">
          <button
            onClick={handleViewFeedback}
            className="rounded-xl px-4 py-2 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
          >
            View Feedback
          </button>

            <button
            onClick={() => navigate(`/eventOfficer/events/${eventId}/details`)}
            className="rounded-xl px-4 py-2 bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-300"
            >
            More Info
            </button>
        </div>

        {showFeedback && (
          <div className="mt-4 border rounded-xl p-4 bg-white shadow-lg">
            <h3 className="text-xl font-bold mb-2">Feedback</h3>

            {loadingFeedback ? (
              <p>Loading...</p>
            ) : (
              <>
                <h4 className="font-semibold mt-2">Ratings:</h4>
                {feedback.ratings.length === 0 ? (
                  <p>No ratings yet</p>
                ) : (
                  feedback.ratings.map((r, i) => <p key={i}>⭐ {r.value}</p>)
                )}

                <h4 className="font-semibold mt-4">Comments:</h4>
                {feedback.comments.length === 0 ? (
                  <p>No comments yet</p>
                ) : (
                  feedback.comments.map((c, i) => <p key={i}>• {c.text}</p>)
                )}
              </>
            )}

            <button
              className="mt-4 bg-gray-300 px-3 py-1 rounded"
              onClick={() => setShowFeedback(false)}
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

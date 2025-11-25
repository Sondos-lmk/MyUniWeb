import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import API from "../services/api";

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

export default function AdminEventCard({ event, onDelete }) {
  const navigate = useNavigate();
  const eventId = event?._id || event?.id;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDeleteEvent = async () => {
    if (!eventId) return;
    if (!window.confirm("Are you sure you want to delete this event?")) {
      setMenuOpen(false);
      return;
    }

    try {
      await API.delete(`/events/${eventId}`);
      onDelete?.(eventId);
      alert("Event deleted successfully!");
    } catch (err) {
      console.error("Delete event error", err);
      alert(err.response?.data?.message || "Failed to delete event.");
    } finally {
      setMenuOpen(false);
    }
  };

  const handleMoreInfo = () => {
    if (!eventId) return;
    navigate(`/admin/events/${eventId}/details`, {
      state: { from: "admin-upcoming" },
    });
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-0.5 overflow-hidden h-full flex flex-col">

      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {menuOpen && (
        <div className="absolute top-12 right-3 bg-white shadow-lg rounded-xl border w-48 z-50 py-2">
          <button
            onClick={handleDeleteEvent}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
          >
            Delete Event
          </button>
        </div>
      )}

      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between gap-3 pr-8">
          <h3 className="text-lg font-semibold break-words">{event.title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium mr-8 ${badgeColor(event.type)}`}>
            {event.type || "event"}
          </span>
        </div>

        {event.desc && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{event.desc}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          {(event.location || event.locationInPlatform || event.sessionType) && (
            <div>
              <div className="text-slate-500">Location</div>
              <div className="font-medium">{normalizeLocation(event)}</div>
            </div>
          )}
          <div>
            <div className="text-slate-500">Start</div>
            <div className="font-medium">{fmt(event.startDate || event.date)}</div>
          </div>
          <div>
            <div className="text-slate-500">End</div>
            <div className="font-medium">{fmt(event.endDate || event.date)}</div>
          </div>
          {event.registrationDeadline && (
            <div className="col-span-2">
              <div className="text-slate-500">Registration Deadline</div>
              <div className="font-medium">{fmt(event.registrationDeadline)}</div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={handleMoreInfo}
            className="rounded-xl px-4 py-2 bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-300"
          >
            More Info
          </button>
        </div>
      </div>
    </div>
  );
}

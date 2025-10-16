// client/src/components/EventCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const badgeColor = (type) => {
  switch (type) {
    case "trip": return "bg-blue-100 text-blue-700";
    case "bazaar": return "bg-amber-100 text-amber-700";
    case "booth": return "bg-fuchsia-100 text-fuchsia-700";
    case "conference": return "bg-emerald-100 text-emerald-700";
    case "workshop": return "bg-purple-100 text-purple-700";
    case "gym": return "bg-rose-100 text-rose-700";
    default: return "bg-slate-100 text-slate-700";
  }
};

export default function EventCard({ event, onPrimary, primaryLabel, secondary, disabled , userRole }) {
  const navigate = useNavigate();
  const {
    _id,
    title,
    desc,
    type,
    location,
    startDate,
    endDate,
    registrationDeadline,
    price,
    capacity,
    status,
  } = event || {};

  const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");

  console.log({
  title,
  userRole,
  eventType: event.type,
  eventStatus: event.status,
});

  const canEdit =
    userRole === "eventofficer" &&
    ["trip", "bazaar", "conference"].includes(event.type);

  return (
    <div
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-0.5 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor(type)}`}>
            {type}
          </span>
        </div>

        {desc ? <p className="mt-2 text-sm text-slate-600 line-clamp-2">{desc}</p> : null}

        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          {location && (
            <div>
              <div className="text-slate-500">Location</div>
              <div className="font-medium">{location}</div>
            </div>
          )}
          {price !== undefined && (
            <div>
              <div className="text-slate-500">Price</div>
              <div className="font-medium">{price} EGP</div>
            </div>
          )}
          {capacity !== undefined && (
            <div>
              <div className="text-slate-500">Capacity</div>
              <div className="font-medium">{capacity}</div>
            </div>
          )}
          {status && (
            <div>
              <div className="text-slate-500">Status</div>
              <div className="font-medium">{status}</div>
            </div>
          )}
          <div>
            <div className="text-slate-500">Start</div>
            <div className="font-medium">{fmt(startDate)}</div>
          </div>
          <div>
            <div className="text-slate-500">End</div>
            <div className="font-medium">{fmt(endDate)}</div>
          </div>
          {registrationDeadline && (
            <div className="col-span-2">
              <div className="text-slate-500">Registration Deadline</div>
              <div className="font-medium">{fmt(registrationDeadline)}</div>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3">
          {onPrimary && (
            <button
              onClick={onPrimary}
              disabled={disabled}
              className="rounded-xl px-4 py-2 bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {primaryLabel || "Action"}
            </button>
          )}
          {secondary}
        </div>
        <div className="mt-5 flex items-center gap-3">
          {canEdit && (
            <button
              onClick={() => navigate(`/events/${event._id}/edit`)}
              className="rounded-xl px-4 py-2 bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
            >
              Edit Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

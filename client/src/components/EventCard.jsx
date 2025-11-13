// client/src/components/EventCard.jsx
import React, { useState } from "react";
import { saveAs } from "file-saver";
import API from "../services/api";
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
  
  // Handle gym sessions differently
  if (event?.type === "gym") {
    // Local editable state for inline edits
    const [gDate, setGDate] = useState(
      event.date ? new Date(event.date).toISOString().slice(0, 10) : ""
    );
    const [gTime, setGTime] = useState(event.time || "");
    const [gDuration, setGDuration] = useState(event.duration || "");
    const [saving, setSaving] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [editing, setEditing] = useState(false);

    const hasChanges =
      gDate !== (event.date ? new Date(event.date).toISOString().slice(0, 10) : "") ||
      gTime !== (event.time || "") ||
      String(gDuration) !== String(event.duration || "");

    const handleSaveGym = async () => {
      try {
        setSaving(true);
        const payload = {};
        if (gDate) payload.date = gDate;
        if (gTime) payload.time = gTime;
        if (gDuration !== "") payload.duration = Number(gDuration);
        await API.patch(`/gym/${event._id}`, payload);
        alert("Gym session updated");
        setEditing(false);
      } catch (err) {
        console.error("Edit gym error:", err);
        alert(err.response?.data?.message || "Failed to update gym session");
      } finally {
        setSaving(false);
      }
    };

    const handleResetGym = () => {
      setGDate(event.date ? new Date(event.date).toISOString().slice(0, 10) : "");
      setGTime(event.time || "");
      setGDuration(event.duration || "");
    };

    const handleCancelGym = async () => {
      try {
        if (!window.confirm("Are you sure you want to cancel this gym session?")) return;
        await API.delete(`/events/${event._id}`);
        setIsDeleted(true);
        alert("Gym session cancelled");
      } catch (err) {
        console.error("Cancel gym error:", err);
        alert(err.response?.data?.message || "Failed to cancel gym session");
      }
    };
    if (isDeleted) return null;

    return (
      <div className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-0.5 overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold capitalize">
              {event.sessionType ? `${event.sessionType} Session` : "Gym Session"}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor("gym")}`}>
              gym
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            {event.sessionType && (
              <div className="col-span-2">
                <div className="text-slate-500">Session Type</div>
                <div className="font-medium capitalize">{event.sessionType}</div>
              </div>
            )}
            {/* Fields: read-only by default; switch to inputs only in edit mode */}
            {editing ? (
              <>
                <div className="p-2 rounded border-2 border-amber-300 bg-amber-50">
                  <div className="text-slate-500">Date (editable)</div>
                  <input
                    type="date"
                    value={gDate}
                    onChange={(e) => setGDate(e.target.value)}
                    className="mt-1 w-full rounded border border-amber-300 bg-white px-2 py-1"
                  />
                </div>
                <div className="p-2 rounded border-2 border-amber-300 bg-amber-50">
                  <div className="text-slate-500">Time (editable)</div>
                  <input
                    type="time"
                    value={gTime}
                    onChange={(e) => setGTime(e.target.value)}
                    className="mt-1 w-full rounded border border-amber-300 bg-white px-2 py-1"
                  />
                </div>
                <div className="p-2 rounded border-2 border-amber-300 bg-amber-50">
                  <div className="text-slate-500">Duration (minutes, editable)</div>
                  <input
                    type="number"
                    min={1}
                    value={gDuration}
                    onChange={(e) => setGDuration(e.target.value)}
                    className="mt-1 w-full rounded border border-amber-300 bg-white px-2 py-1"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="text-slate-500">Date</div>
                  <div className="font-medium">{gDate ? new Date(gDate).toLocaleDateString() : "—"}</div>
                </div>
                <div>
                  <div className="text-slate-500">Time</div>
                  <div className="font-medium">{gTime || "—"}</div>
                </div>
                <div>
                  <div className="text-slate-500">Duration</div>
                  <div className="font-medium">{gDuration ? `${gDuration} minutes` : "—"}</div>
                </div>
              </>
            )}
            {event.maxParticipants !== undefined && (
              <div>
                <div className="text-slate-500">Max Participants</div>
                <div className="font-medium">{event.maxParticipants}</div>
              </div>
            )}
          </div>

          {/* Event Officer actions for Gym */}
          {userRole === "eventOfficer" && (
            <div className="mt-4 flex flex-wrap gap-3">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-xl px-4 py-2 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveGym}
                    disabled={!hasChanges || saving}
                    className="rounded-xl px-4 py-2 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleResetGym}
                    disabled={!hasChanges || saving}
                    className="rounded-xl px-4 py-2 bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-300 disabled:opacity-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => { handleResetGym(); setEditing(false); }}
                    className="rounded-xl px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
                  >
                    Cancel Editing
                  </button>
                </>
              )}
              <button
                onClick={handleCancelGym}
                className="rounded-xl px-4 py-2 bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
              >
                Cancel Session
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular event handling
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

const handleExportRegistrations = async () => {
  try {
    const res = await API.get(`/events/${event._id}/export-registrations`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${event.title.replace(/\s+/g, "_")}_registrations.xlsx`);
  } catch (err) {
    console.error("Export error:", err);

    // ✅ Improved user-facing message
    if (err.response?.status === 400) {
      alert(err.response.data.message || "No users registered for this event.");
    } else if (err.response?.status === 403) {
      alert("Access denied. Only Event Officers can export registrations.");
    } else if (err.response?.status === 404) {
      alert("Event not found.");
    } else {
      alert("Something went wrong while exporting. Please try again.");
    }
  }
};


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
          {status && (type === "workshop" || type === "booth") && (
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
        {/* ✅ Event Officer Actions */}
        <div className="mt-5 flex items-center gap-3">
        {/* Edit Event — only for Trips, Bazaars, Conferences */}
        {userRole === "eventOfficer" &&
          ["trip", "bazaar", "conference"].includes(event.type) && (
            <button
              onClick={() => navigate(`/events/${event._id}/edit`)}
              className="rounded-xl px-4 py-2 bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
            >
              Edit Event
            </button>
                )}
            </div>
            {userRole === "eventOfficer" && event.type !== "conference" && (
            <button
              onClick={handleExportRegistrations}
              className="rounded-xl px-4 py-2 bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
            >
              Export Registrations
            </button>
          )}
      </div>
    </div>
  );
}

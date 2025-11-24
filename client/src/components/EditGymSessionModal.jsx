// client/src/components/EditGymSessionModal.jsx
import React, { useState } from "react";
import api from "../services/api";
import Modal from "./ui/Modal";

export default function EditGymSessionModal({ session, onClose, onSaved }) {
  // Pre-fill fields from the session
  const [date, setDate] = useState(
    session.date ? new Date(session.date).toISOString().slice(0, 10) : ""
  );
  const [time, setTime] = useState(session.time || "");
  const [duration, setDuration] = useState(session.duration || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.patch(`/gym/${session._id}`, {
        date,
        time,
        duration,
      });

      if (onSaved) onSaved();
    } catch (err) {
      console.error("Update gym session error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update gym session.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">Edit Gym Session</h2>

      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date
          </label>
          <input
            type="date"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Time
          </label>
          <input
            type="time"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// client/src/pages/BoothApply.jsx
import React, { useState } from "react";
import { applyForBooth } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";

export default function BoothApply() {
  const { boothId } = useParams();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(1);
  const [reps, setReps] = useState([{ name: "", email: "" }]);
  const [busy, setBusy] = useState(false);

  const addRep = () => {
    if (reps.length >= 5) return;
    setReps([...reps, { name: "", email: "" }]);
  };
  const removeRep = (idx) => setReps(reps.filter((_, i) => i !== idx));
  const updateRep = (idx, key, val) =>
    setReps((arr) => arr.map((r, i) => (i === idx ? { ...r, [key]: val } : r)));

  const submit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      await applyForBooth(boothId, { startDate, durationWeeks, reps });
      alert("Booth application submitted ✅");
      navigate("/my-applications");
    } catch (err) {
      alert(err?.message || "Failed to apply");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Apply to Booth</h1>
      <p className="text-slate-600">Choose your dates and add up to 5 representatives.</p>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              required
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (weeks)</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
            >
              {[1, 2, 3, 4].map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Representatives</label>
            <button
              type="button"
              onClick={addRep}
              disabled={reps.length >= 5}
              className="text-sm underline"
            >
              Add Rep (max 5)
            </button>
          </div>

          <div className="mt-3 space-y-4">
            {reps.map((r, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  value={r.name}
                  onChange={(e) => updateRep(idx, "name", e.target.value)}
                  placeholder="Rep Name"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
                <div className="flex gap-3">
                  <input
                    required
                    type="email"
                    value={r.email}
                    onChange={(e) => updateRep(idx, "email", e.target.value)}
                    placeholder="Rep Email"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeRep(idx)}
                    className="px-3 py-2 rounded-xl border border-slate-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          disabled={busy}
          className="rounded-xl px-5 py-2.5 bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

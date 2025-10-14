// client/src/pages/MyEvents.jsx
import React, { useEffect, useState } from "react";
import { fetchMyRegisteredEvents } from "../services/api";

export default function MyEvents() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setErr(""); setLoading(true);
      const res = await fetchMyRegisteredEvents();
      setRows(Array.isArray(res) ? res : []);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">My Registered Events</h1>
      <p className="text-slate-600">Events you have successfully registered for.</p>

      <div className="mt-6">
        {loading && <div className="text-slate-500">Loading…</div>}
        {err && <div className="text-rose-600">{err}</div>}
        {!loading && !rows.length && !err && (
          <div className="text-slate-500">You haven’t registered for any events yet.</div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((ev) => (
            <div key={ev._id} className="rounded-2xl border border-slate-200 p-5 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{ev.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100">{ev.type}</span>
              </div>
              <div className="mt-3 text-sm text-slate-700">{ev.location || "—"}</div>
              <div className="mt-2 text-xs text-slate-500">
                {ev.startDate ? new Date(ev.startDate).toLocaleString() : ""} —{" "}
                {ev.endDate ? new Date(ev.endDate).toLocaleString() : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

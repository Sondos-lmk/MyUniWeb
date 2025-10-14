// client/src/pages/MyApplications.jsx
import React, { useEffect, useState } from "react";
import { fetchMyApplications } from "../services/api";

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setErr(""); setLoading(true);
      const res = await fetchMyApplications();
      setApps(res?.applications || []);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">My Applications</h1>
      <p className="text-slate-600">Your bazaar and booth applications with status.</p>

      <div className="mt-6">
        {loading && <div className="text-slate-500">Loading…</div>}
        {err && <div className="text-rose-600">{err}</div>}
        {!loading && !apps.length && !err && (
          <div className="text-slate-500">No applications yet.</div>
        )}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3 font-medium">{a.type}</td>
                  <td className="px-4 py-3">{a.title}</td>
                  <td className="px-4 py-3">{a.location || "—"}</td>
                  <td className="px-4 py-3">{a.startDate ? new Date(a.startDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">{a.endDate ? new Date(a.endDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      a.status === "approved" ? "bg-emerald-100 text-emerald-700"
                      : a.status === "rejected" ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

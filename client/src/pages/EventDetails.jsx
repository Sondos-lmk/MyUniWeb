// client/src/pages/EventDetails.jsx
import React, { useEffect, useState } from "react";
import { fetchEventById, registerForEvent } from "../services/api";
import { useParams } from "react-router-dom";

export default function EventDetails() {
  const { id } = useParams();
  const [ev, setEv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setErr(""); setLoading(true);
      const data = await fetchEventById(id);
      setEv(data);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const canRegister = ev?.type === "trip" &&
    (!ev.registrationDeadline || new Date() <= new Date(ev.registrationDeadline));

  const doRegister = async () => {
    try {
      await registerForEvent(ev._id);
      alert("Registered successfully ✅");
      load();
    } catch (e) {
      alert(e.message || "Failed to register");
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading…</div>;
  if (err) return <div className="p-8 text-rose-600">{err}</div>;
  if (!ev) return null;

  const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{ev.title}</h1>
      <div className="mt-2 text-slate-600">{ev.desc || "No description."}</div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div><div className="text-slate-500">Type</div><div className="font-medium">{ev.type}</div></div>
        <div><div className="text-slate-500">Location</div><div className="font-medium">{ev.location || "—"}</div></div>
        <div><div className="text-slate-500">Start</div><div className="font-medium">{fmt(ev.startDate)}</div></div>
        <div><div className="text-slate-500">End</div><div className="font-medium">{fmt(ev.endDate)}</div></div>
        {ev.registrationDeadline && (
          <div className="col-span-2"><div className="text-slate-500">Registration Deadline</div><div className="font-medium">{fmt(ev.registrationDeadline)}</div></div>
        )}
        {ev.capacity !== undefined && (
          <div><div className="text-slate-500">Capacity</div><div className="font-medium">{ev.capacity}</div></div>
        )}
        {ev.price !== undefined && (
          <div><div className="text-slate-500">Price</div><div className="font-medium">{ev.price} EGP</div></div>
        )}
      </div>

      {canRegister && (
        <div className="mt-6">
          <button
            onClick={doRegister}
            className="rounded-xl px-5 py-2.5 bg-slate-900 text-white font-semibold hover:bg-slate-800"
          >
            Register for Trip
          </button>
        </div>
      )}
    </div>
  );
}

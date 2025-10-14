// client/src/pages/Events.jsx
import React, { useEffect, useMemo, useState } from "react";
import EventCard from "../components/EventCard";
import { fetchEvents, registerForEvent } from "../services/api";
import { useNavigate } from "react-router-dom";

const TABS = ["all", "trip", "bazaar", "booth", "conference", "workshop", "gym"];

export default function Events() {
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const data = await fetchEvents(tab === "all" ? undefined : tab);
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleRegisterTrip = async (id) => {
    try {
      await registerForEvent(id);
      alert("Registered successfully ✅");
      await load();
    } catch (e) {
      alert(e?.message || "Failed to register");
    }
  };

  const header = useMemo(() => (
    <div className="flex flex-wrap items-center gap-2">
      {TABS.map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`px-4 py-2 rounded-full border text-sm ${
            tab === t ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"
          }`}
        >
          {t[0].toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  ), [tab]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Explore Events</h1>
          <p className="text-slate-600">Find trips, bazaars, booths, workshops and more.</p>
        </div>
        {header}
      </div>

      <div className="mt-6">
        {loading && <div className="text-slate-500">Loading…</div>}
        {err && <div className="text-rose-600">{err}</div>}
        {!loading && !events.length && !err && (
          <div className="text-slate-500">No events found.</div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => {
            const isTrip = ev.type === "trip";
            const isBazaar = ev.type === "bazaar";
            const isBooth = ev.type === "booth";

            const registrationClosed =
              ev.registrationDeadline && new Date() > new Date(ev.registrationDeadline);

            const primary = isTrip
              ? () => handleRegisterTrip(ev._id)
              : isBazaar
              ? () => navigate(`/bazaars/${ev._id}/apply`)
              : isBooth
              ? () => navigate(`/booths/${ev._id}/apply`)
              : undefined;

            const label = isTrip
              ? "Register"
              : isBazaar
              ? "Apply to Bazaar"
              : isBooth
              ? "Apply to Booth"
              : undefined;

            return (
              <EventCard
                key={ev._id}
                event={ev}
                onPrimary={primary}
                primaryLabel={label}
                disabled={isTrip && registrationClosed}
                secondary={
                  <button
                    className="text-sm underline text-slate-600 hover:text-slate-900"
                    onClick={() => navigate(`/events/${ev._id}`)}
                  >
                    Details
                  </button>
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

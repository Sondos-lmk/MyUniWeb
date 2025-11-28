import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import AdminEventCard from "./AdminEventCard";

const getEventStart = (event) => event.startDate || event.date;
const getEventEnd = (event) => event.endDate || event.date;

export default function AdminUpcomingEventsGrid() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events/");
        const payload = Array.isArray(res.data)
          ? res.data
          : res.data?.events || [];
        setEvents(payload);
      } catch (err) {
        console.error("Failed to load events", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const normalizeId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (value.toString) return value.toString();
    return null;
  };

  const handleEventDeleted = (deletedId) => {
    if (!deletedId) return;
    const normalizedDeletedId = normalizeId(deletedId);
    setEvents((prev) =>
      prev.filter((event) => normalizeId(event._id || event.id) !== normalizedDeletedId)
    );
  };

  const filteredEvents = useMemo(() => {
    const now = new Date();
    let list = events.filter((event) => {
      const start = getEventStart(event);
      if (!start) return false;
      const startDate = new Date(start);
      if (Number.isNaN(startDate.getTime())) return false;
      // Exclude gym events
      if (event.type === "gym") return false;
      return startDate > now;
    });

    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      list = list.filter((event) => {
        const titleMatch = event.title?.toLowerCase().includes(query);
        const descMatch = event.desc?.toLowerCase().includes(query);
        const professorMatch = Array.isArray(event.professorsParticipating)
          ? event.professorsParticipating.some((prof) =>
              prof.name?.toLowerCase().includes(query)
            )
          : false;
        return titleMatch || descMatch || professorMatch;
      });
    }

    if (filterType) {
      list = list.filter((event) => event.type === filterType);
    }

    if (filterLocation.trim()) {
      const normalized = filterLocation.toLowerCase();
      list = list.filter((event) =>
        (event.location || event.locationInPlatform || "")
          .toLowerCase()
          .includes(normalized)
      );
    }

    if (filterDate) {
      const target = new Date(filterDate).toDateString();
      list = list.filter((event) => {
        const start = getEventStart(event);
        const end = getEventEnd(event);
        const startString = start ? new Date(start).toDateString() : "";
        const endString = end ? new Date(end).toDateString() : "";
        return startString === target || endString === target;
      });
    }

    list.sort((a, b) => {
      const startA = new Date(getEventStart(a));
      const startB = new Date(getEventStart(b));
      return sortOrder === "asc" ? startA - startB : startB - startA;
    });

    return list;
  }, [events, searchValue, filterType, filterLocation, filterDate, sortOrder]);

  const handleReset = () => {
    setSearchValue("");
    setFilterType("");
    setFilterLocation("");
    setFilterDate("");
    setSortOrder("asc");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>

      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by event name, description, or professor..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="border border-slate-300 px-3 py-2 rounded-lg w-full md:w-1/3"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-slate-300 px-3 py-2 rounded-lg"
        >
          <option value="">All Types</option>
          <option value="bazaar">Bazaar</option>
          <option value="conference">Conference</option>
          <option value="trip">Trip</option>
          <option value="workshop">Workshop</option>
        </select>

        <input
          placeholder="Location"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="border border-slate-300 px-3 py-2 rounded-lg"
        />

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border border-slate-300 px-3 py-2 rounded-lg"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border border-slate-300 px-3 py-2 rounded-lg"
        >
          <option value="asc">Oldest First</option>
          <option value="desc">Newest First</option>
        </select>

        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
        >
          Reset
        </button>
      </div>

      <div className="border-b border-slate-200 mb-6 flex gap-6">
        <span className="pb-3 text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600">
          Upcoming
        </span>
      </div>

      {loading ? (
        <p className="text-center text-slate-500">Loading events...</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-slate-600">No upcoming events found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const eventId =
              normalizeId(event._id || event.id) ||
              `${event.title || "event"}-${getEventStart(event) || "unknown"}`;
            return (
              <AdminEventCard
                key={eventId}
                event={event}
                onDelete={handleEventDeleted}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

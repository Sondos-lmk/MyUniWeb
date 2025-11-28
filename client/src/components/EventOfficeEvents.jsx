import { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import EventOfficerEventCard from "./EventOfficeEventCard";
import EditEventForm from "./EditEventForm";
import GenerateVisitorQRModal from "./GenerateVisitorQRModal";

export default function EventOfficerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("all");

  // Search, filter, sort states
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Modals
  const [editingEventId, setEditingEventId] = useState(null);
  const [qrEventId, setQrEventId] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events/");
        // Filter out gym sessions since they have their own schedule section
        const filteredEvents = (res.data.events || []).filter(event => event.type !== "gym");
        setEvents(filteredEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const now = new Date();

  // -----------------------------------
  // PHASE 1: TAB FILTERS
  // -----------------------------------
  const tabFiltered = useMemo(() => {
    return events.filter((event) => {
      if (activeTab === "all") return true;

      if (activeTab === "upcoming") {
        return new Date(event.startDate) > now;
      }

      if (activeTab === "archived") {
        return new Date(event.endDate || event.startDate) < now;
      }

      return true;
    });
  }, [events, activeTab]);

  // -----------------------------------
  // PHASE 2: SEARCH / FILTER / SORT
  // -----------------------------------
  const fullyFiltered = useMemo(() => {
    let list = [...tabFiltered];

    // SEARCH
    if (searchValue.trim() !== "") {
      const q = searchValue.toLowerCase();

      list = list.filter((event) => {
        const titleMatch = event.title?.toLowerCase().includes(q);
        const descMatch = event.desc?.toLowerCase().includes(q);

        // if it's workshop → search professors
        const professorMatch = Array.isArray(event.professorsParticipating)
          ? event.professorsParticipating.some((p) =>
              p.name?.toLowerCase().includes(q)
            )
          : false;

        return titleMatch || descMatch || professorMatch;
      });
    }

    // FILTER BY TYPE
    if (filterType) {
      list = list.filter((e) => e.type === filterType);
    }

    // FILTER BY LOCATION
    if (filterLocation.trim() !== "") {
      const loc = filterLocation.toLowerCase();
      list = list.filter((e) =>
        (e.location || e.locationInPlatform || "")
          .toLowerCase()
          .includes(loc)
      );
    }

    // FILTER BY SPECIFIC DATE
    if (filterDate) {
      const target = new Date(filterDate).toDateString();
      list = list.filter((e) => {
        const s = new Date(e.startDate).toDateString();
        const eD = new Date(e.endDate || e.startDate).toDateString();
        return s === target || eD === target;
      });
    }

    // SORT BY START DATE
    list.sort((a, b) => {
      const da = new Date(a.startDate);
      const db = new Date(b.startDate);
      return sortOrder === "asc" ? da - db : db - da;
    });

    return list;
  }, [tabFiltered, searchValue, filterType, filterLocation, filterDate, sortOrder]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      <h1 className="text-3xl font-bold mb-6">Events</h1>

      {/* -------------------- */}
      {/* Search / Filter / Sort Bar */}
      {/* -------------------- */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">

        {/* Search */}
        <input
          type="text"
          placeholder="Search by event name, description, or professor..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="border border-slate-300 px-3 py-2 rounded-lg w-full md:w-1/3"
        />

        {/* Type */}
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

        {/* Location */}
        <input
          placeholder="Location"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="border border-slate-300 px-3 py-2 rounded-lg"
        />

        {/* Date */}
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border border-slate-300 px-3 py-2 rounded-lg"
        />

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border border-slate-300 px-3 py-2 rounded-lg"
        >
          <option value="asc">Oldest First</option>
          <option value="desc">Newest First</option>
        </select>
      </div>

      {/* -------------------- */}
      {/* Tabs */}
      {/* -------------------- */}
      <div className="border-b border-slate-200 mb-6 flex gap-6">
        {["all", "upcoming", "archived"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize ${
              activeTab === tab
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "all" ? "All Events" : tab}
          </button>
        ))}
      </div>

      {/* -------------------- */}
      {/* Content */}
      {/* -------------------- */}
      {loading ? (
        <p className="text-center text-slate-500">Loading events...</p>
      ) : fullyFiltered.length === 0 ? (
        <p className="text-slate-600">No events found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fullyFiltered.map((event) => (
            <EventOfficerEventCard
              key={event._id}
              event={event}
              onEdit={(id) => setEditingEventId(id)}
              onGenerateQr={(id) => setQrEventId(id)}
            />
          ))}
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEventId && (
        <EditEventForm
          eventId={editingEventId}
          onClose={() => setEditingEventId(null)}
        />
      )}

      {/* QR Modal */}
      {qrEventId && (
        <GenerateVisitorQRModal
          eventId={qrEventId}
          onClose={() => setQrEventId(null)}
        />
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import API from "../services/api";
import EventCard from "../components/EventCard";
import ModernAlert from "./ui/ModernAlert";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search } from "lucide-react";

// ⭐ Now accepts favorites + userRole from dashboard
const UpcomingEvents = ({ favoritesSet, onToggleFavorite, userRole = "student" }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(""); // format YYYY-MM-DD
  const [sortOrder, setSortOrder] = useState("asc");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  // Fetch all upcoming events (default)
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/events/upcoming", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter out gym events
      const allEvents = res.data.events || [];
      const filteredEvents = allEvents.filter(event => event.type !== "gym");
      setEvents(filteredEvents);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load upcoming events.");
    } finally {
      setLoading(false);
    }
  };

  // Search by name/type
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchName && !type) {
      fetchEvents();
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/events/search", {
        params: { name: searchName, type },
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter out gym events
      const allEvents = res.data.events || [];
      const filteredEvents = allEvents.filter(event => event.type !== "gym");
      setEvents(filteredEvents);
      setError(null);
    } catch (err) {
      console.error("Error searching events:", err);
      if (err.response?.status === 404)
        setError("No events found matching your search.");
      else setError("Failed to search events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const token = localStorage.getItem("token");
  
      const params = {};
      if (searchName) params.title = searchName;
      if (type) params.type = type;
      if (location) params.location = location;
      if (date) params.date = date;
      if (sortOrder) params.sort = sortOrder;
  
      const res = await API.get("/events", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const payload = Array.isArray(res.data)
        ? res.data
        : res.data.events || [];
  
      // Filter out gym events
      const filteredEvents = payload.filter(event => event.type !== "gym");
      setEvents(filteredEvents);
    } catch (err) {
      console.error("Error filtering events:", err);
      setError("Failed to filter events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-4">
      {/* 🔍 Search and Filter Section */}
      <div className="space-y-4">
        {/* Top Row: Search, Type Filter, Search Button */}
        <form
          onSubmit={handleSearch}
          className="grid md:grid-cols-3 gap-4 items-end"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by event or professor name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="trip">Trip</SelectItem>
              <SelectItem value="bazaar">Bazaar</SelectItem>
              <SelectItem value="booth">Booth</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Search
          </Button>
        </form>

        {/* Bottom Row: Location, Date, Sort, Filter Button */}
        <form
          onSubmit={handleAdvancedSearch}
          className="grid md:grid-cols-2 gap-4 items-end"
        >
          <Input
            type="text"
            placeholder="Filter by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </form>

        <div className="flex gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
              setSortOrder(newSortOrder);
              // Trigger search with new sort order
              setLoading(true);
              setError(null);
              
              try {
                const token = localStorage.getItem("token");
                const params = {};
                if (searchName) params.title = searchName;
                if (type) params.type = type;
                if (location) params.location = location;
                if (date) params.date = date;
                params.sort = newSortOrder;
                
                const res = await API.get("/events", {
                  params,
                  headers: { Authorization: `Bearer ${token}` },
                });
                
                const payload = Array.isArray(res.data)
                  ? res.data
                  : res.data.events || [];
                
                // Filter out gym events
                const filteredEvents = payload.filter(event => event.type !== "gym");
                setEvents(filteredEvents);
              } catch (err) {
                console.error("Error sorting events:", err);
                setError("Failed to sort events.");
              } finally {
                setLoading(false);
              }
            }}
          >
            Sort by Date {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
          <Button
            type="button"
            onClick={handleAdvancedSearch}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Filter by Location/Date
          </Button>
        </div>
      </div>

      {/* ⚙️ Loading & Error States */}
      {loading && <p>Loading events...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p>No upcoming events available.</p>
      )}

      {/* 📋 Event List using EventCard + favorites */}
      <div className="space-y-3">
        {events.map((event) => {
          const id = event._id || event.id;

          // theme classes for primary/register button per event type
          const typeClassMap = {
            trip: 'bg-blue-600 hover:bg-blue-700 text-white',
            bazaar: 'bg-amber-600 hover:bg-amber-700 text-white',
            booth: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white',
            conference: 'bg-emerald-600 hover:bg-emerald-700 text-white',
            workshop: 'bg-purple-600 hover:bg-purple-700 text-white',
            gym: 'bg-rose-600 hover:bg-rose-700 text-white',
            default: 'bg-slate-900 hover:bg-slate-800 text-white'
          };

          const primaryClass = typeClassMap[event.type] || typeClassMap.default;

          const handleRegister = async () => {
            try {
              setLoading(true);
              await API.post(`/events/register/${id}`, { eventId: id });
              showAlert('Registration successful', 'success');
              // optionally refresh event list
              await fetchEvents();
            } catch (err) {
              console.error('Register error', err);
              showAlert(err.response?.data?.error || 'Registration failed', 'error');
            } finally {
              setLoading(false);
            }
          };

          return (
            <EventCard
              key={id}
              event={event}
              userRole={userRole}
              isFavorite={favoritesSet?.has(id)}
              onToggleFavorite={onToggleFavorite}
              onPrimary={userRole === 'student' ? handleRegister : undefined}
              primaryLabel={userRole === 'student' ? 'Register' : undefined}
              primaryClass={primaryClass}
            />
          );
        })}
      </div>

      {/* 
        🔒 ORIGINAL RENDER BLOCK (kept for reference, not used anymore):
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="border p-4 rounded-lg shadow-sm bg-white"
            >
              {event.type === "gym" ? (
                <>
                  <h3 className="text-lg font-bold">
                    Gym Session{event.sessionType ? ` - ${event.sessionType.charAt(0).toUpperCase() + event.sessionType.slice(1)}` : ''}
                  </h3>
                  <p><strong>Type:</strong> {event.type}</p>
                  {event.sessionType && (
                    <p><strong>Session Type:</strong> <span className="capitalize">{event.sessionType}</span></p>
                  )}
                  {event.date && (
                    <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                  )}
                  {event.time && (
                    <p><strong>Time:</strong> {event.time}</p>
                  )}
                  {event.duration && (
                    <p><strong>Duration:</strong> {event.duration} minutes</p>
                  )}
                  {event.maxParticipants !== undefined && (
                    <p><strong>Max Participants:</strong> {event.maxParticipants}</p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold">{event.title}</h3>
                  <p><strong>Type:</strong> {event.type}</p>
                  <p><strong>Description:</strong> {event.description || "No description"}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Start:</strong> {new Date(event.startDate).toLocaleString()}</p>
                  <p><strong>End:</strong> {new Date(event.endDate).toLocaleString()}</p>
                  {event.status && (event.type === "workshop" || event.type === "booth") && (
                    <p><strong>Status:</strong> {event.status}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      */}

      {alertMessage && (
        <ModernAlert
          message={alertMessage}
          type={alertType}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
};

export default UpcomingEvents;
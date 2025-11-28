import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import UpcomingEvents from "../components/UpcomingEvents";
import MyRegisteredEvents from "./MyRegisteredEvents";
import RegisterForEvent from "./RegisterForEvent";
import GymSchedule from "./GymSchedule";
import api from "../services/api";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import AttendedEvents from "./AttendedEvents";
import VendorPolls from "../components/VendorPolls";

// Favorites imports
import { fetchMyFavorites } from "../services/favorites";
import EventCard from "../components/EventCard";
import ProfessorEventCard from "../components/ProfessorEventCard";
import { useAuth } from "../context/AuthContext";
import { Calendar, CheckCircle, Star, Home, Trophy, Dumbbell, Store, Heart, Clock, CalendarDays, MessageSquare, Vote } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import LoyaltyVendors from "./LoyaltyVendors";
import EventsReviews from "./EventsReviews";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("events");
  const [eventsTab, setEventsTab] = useState("upcoming"); // "upcoming", "registered", "favorites", "attended"
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [error, setError] = useState("");
  const [lastBooking, setLastBooking] = useState(null);

  // Favorites
  const [favorites, setFavorites] = useState([]);
  const [favSet, setFavSet] = useState(new Set());

  // Gym sessions
  const [gymSessions, setGymSessions] = useState([]);
  const [loadingGym, setLoadingGym] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  // Events management
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const navigate = useNavigate();

  // Fetch gym sessions
  const fetchGymSessions = async () => {
    try {
      setLoadingGym(true);
      const res = await api.get("/gym");
      setGymSessions(res.data || []);
    } catch (err) {
      console.error("Error fetching gym sessions:", err);
    } finally {
      setLoadingGym(false);
    }
  };

  // Handle gym registration
  const handleGymRegister = async (sessionId) => {
    try {
      setRegisteringId(sessionId);
      await api.post(`/gym/${sessionId}/register`);
      fetchGymSessions(); // Refresh sessions
    } catch (err) {
      console.error("Error registering for gym session:", err);
      alert(err.response?.data?.message || "Failed to register for session");
    } finally {
      setRegisteringId(null);
    }
  };

  // Fetch events + my registered + favorites
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

        const eventsRes = await axios.get(`${apiUrl}/api/events/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingEvents(eventsRes.data.events || []);

        const myEventsRes = await axios.get(
          `${apiUrl}/api/events/my-registered`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMyEvents(myEventsRes.data || []);

        // Favorites
        const favs = await fetchMyFavorites();
        setFavorites(favs);
        setFavSet(new Set(favs.map((e) => e._id || e.id)));

      } catch (err) {
        console.error("Error fetching student dashboard data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [navigate]);

  // Load events when Events tab is active
  useEffect(() => {
    if (activeSection === "events") {
      fetchEvents();
    }
  }, [activeSection]);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await API.get("/events/");
      const payload = Array.isArray(res.data) ? res.data : res.data?.events || [];
      setEvents(payload);
    } catch (err) {
      console.error("Failed to load events", err);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Filter and sort events
  const getEventStart = (event) => event.startDate || event.date;
  const getEventEnd = (event) => event.endDate || event.date;

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
        return titleMatch || descMatch;
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

  const handleResetFilters = () => {
    setSearchValue("");
    setFilterType("");
    setFilterLocation("");
    setFilterDate("");
    setSortOrder("asc");
  };

  const quickActionClasses =
    "w-full h-16 text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 flex items-center justify-center gap-2 text-white rounded-lg shadow";

  // Toggle Favorite
  const handleToggleFavorite = (eventId, willBeFav, eventObj) => {
    setFavSet((prev) => {
      const s = new Set(prev);
      if (willBeFav) s.add(eventId);
      else s.delete(eventId);
      return s;
    });

    setFavorites((prev) => {
      if (willBeFav) {
        return prev.some((e) => (e._id || e.id) === eventId)
          ? prev
          : [...prev, eventObj];
      }
      return prev.filter((e) => (e._id || e.id) !== eventId);
    });
  };

  // Sidebar items for student dashboard
  const sidebarItems = [
    { key: "events", label: "Events", icon: CalendarDays, onClick: () => setActiveSection("events") },
    { key: "eventsReviews", label: "Events Reviews", icon: MessageSquare, onClick: () => setActiveSection("eventsReviews") },
    { key: "boothPolls", label: "Booth Polls", icon: Vote, onClick: () => setActiveSection("boothPolls") },
    { key: "courts", label: "View Courts", icon: Trophy, onClick: () => { setActiveSection("courts"); fetchCourts(); } },
    { key: "gymSchedule", label: "Gym Schedule", icon: Dumbbell, onClick: () => setActiveSection("gymSchedule") },
    { key: "loyaltyVendors", label: "Loyalty Vendors", icon: Store, onClick: () => setActiveSection("loyaltyVendors") },
  ];

  // Courts: fetch all courts
  const fetchCourts = async () => {
    setLoadingCourts(true);
    try {
      const res = await api.get("/courts");
      setCourts(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load courts.");
    } finally {
      setLoadingCourts(false);
    }
  };

  // Courts: fetch availability
  const fetchAvailability = async (courtId) => {
    setSelectedCourt(courtId);
    setLoadingCourts(true);
    try {
      const res = await api.get(`/courts/${courtId}/availability`);
      setAvailability(res.data.days || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not fetch availability.");
    } finally {
      setLoadingCourts(false);
    }
  };

  // Courts: book a slot
  const bookCourt = async (courtId, date, startTime, endTime) => {
    try {
      const res = await api.post(`/courts/${courtId}/book`, {
        date,
        startTime,
        endTime,
      });

      const b = res.data.booking;

      setLastBooking({
        date,
        startTime,
        endTime,
        studentName: b.studentName,
        studentGucId: b.studentGucId,
      });

      fetchAvailability(courtId);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <DashboardLayout
      dashboardTitle="Student Dashboard"
      roleLabel="Verified Student"
      roleColor="bg-green-500"
      sidebarItems={sidebarItems}
      activeKey={activeSection}
    >
      <div className="mt-6">

        {/* Events Section with Tabs */}
        {activeSection === "events" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Events Management</h2>
            
            <div className="border-b border-slate-200 mb-6 flex gap-4 flex-wrap">
              <button
                onClick={() => setEventsTab("upcoming")}
                className={`pb-3 px-2 text-sm font-semibold ${eventsTab === "upcoming" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-slate-600 hover:text-slate-900"}`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setEventsTab("registered")}
                className={`pb-3 px-2 text-sm font-semibold ${eventsTab === "registered" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-slate-600 hover:text-slate-900"}`}
              >
                My Registrations
              </button>
              <button
                onClick={() => setEventsTab("favorites")}
                className={`pb-3 px-2 text-sm font-semibold ${eventsTab === "favorites" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-slate-600 hover:text-slate-900"}`}
              >
                Favorites
              </button>
              <button
                onClick={() => setEventsTab("attended")}
                className={`pb-3 px-2 text-sm font-semibold ${eventsTab === "attended" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-slate-600 hover:text-slate-900"}`}
              >
                Attended Events
              </button>
            </div>

            {eventsTab === "upcoming" && (
              <div>
                {/* Search and Filters */}
                <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Search by title..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">All Types</option>
                      <option value="workshop">Workshop</option>
                      <option value="trip">Trip</option>
                      <option value="bazaar">Bazaar</option>
                      <option value="conference">Conference</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Filter by location..."
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="flex gap-4 mt-4">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="asc">Earliest First</option>
                      <option value="desc">Latest First</option>
                    </select>
                    <button
                      onClick={handleResetFilters}
                      className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>

                {/* Events Grid */}
                {loadingEvents ? (
                  <p className="text-center text-slate-600">Loading events...</p>
                ) : filteredEvents.length === 0 ? (
                  <p className="text-center text-slate-600">No upcoming events found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((ev) => {
                      const id = ev._id || ev.id;
                      return (
                        <ProfessorEventCard
                          key={id}
                          event={ev}
                          currentUser={user}
                          userRole="student"
                          isFavorite={favSet.has(id)}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {eventsTab === "registered" && (
              <MyRegisteredEvents />
            )}

            {eventsTab === "favorites" && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-4">My Favorites</h2>
                {favorites.length === 0 ? (
                  <p className="text-center text-gray-600">No favorite events yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {favorites.map((ev) => {
                      const id = ev._id || ev.id;
                      return (
                        <ProfessorEventCard
                          key={id}
                          event={ev}
                          currentUser={user}
                          userRole="student"
                          isFavorite={favSet.has(id)}
                          onToggleFavorite={handleToggleFavorite}
                          isFavoritesView={true}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {eventsTab === "attended" && (
              <AttendedEvents />
            )}
          </div>
        )}

        {/* Events Reviews Section */}
        {activeSection === "eventsReviews" && (
          <EventsReviews />
        )}

        {/* Booth Polls Section */}
        {activeSection === "boothPolls" && (
          <div>
            <VendorPolls />
          </div>
        )}

        {/* COURTS */}
        {activeSection === "courts" && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-4">
            Campus Courts
          </h2>

          {error && <p className="text-red-600 text-center">{error}</p>}

          {loadingCourts ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courts.map((court) => (
                <div
                  key={court._id}
                  className={`border rounded-lg p-4 shadow cursor-pointer ${
                    selectedCourt === court._id ? "bg-blue-50" : "bg-white"
                  }`}
                  onClick={() => fetchAvailability(court._id)}
                >
                  <h3 className="text-xl font-semibold">{court.name}</h3>
                  <p className="capitalize text-gray-600">{court.type}</p>
                  <p className="text-sm text-gray-500">{court.location}</p>
                </div>
              ))}
            </div>
          )}

          {availability.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-center mb-2">
                Availability
              </h3>

              <div className="grid gap-3">
                {availability.map((day) => (
                  <div
                    key={day.date}
                    className="border rounded-md p-3 bg-gray-50 shadow-sm"
                  >
                    <p className="font-semibold">{day.date}</p>

                    {day.slots.length > 0 ? (
                      <ul className="ml-4 list-disc">
                        {day.slots.map((slot, i) => (
                          <div
                            key={i}
                            onClick={() =>
                              bookCourt(
                                selectedCourt,
                                day.date,
                                slot.startTime,
                                slot.endTime
                              )
                            }
                            className="mt-2 mx-auto w-fit px-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 cursor-pointer shadow"
                          >
                            <div className="font-semibold text-center">
                              {slot.startTime} - {slot.endTime}
                            </div>

                            {slot.booked && (
                              <div className="text-sm text-center mt-1">
                                {slot.studentName} – {slot.studentGucId}
                              </div>
                            )}
                          </div>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No available slots</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        )}

        {/* Gym Schedule Section */}
        {activeSection === "gymSchedule" && (
          <GymSchedule />
        )}

        {/* Loyalty Vendors Section */}
        {activeSection === "loyaltyVendors" && (
          <LoyaltyVendors />
        )}

      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;

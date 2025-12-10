import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import UpcomingEvents from "../components/UpcomingEvents";
import MyRegisteredEvents from "./MyRegisteredEvents";
import RegisterForEvent from "./RegisterForEvent";
import GymSchedule from "./GymSchedule";
import DashboardLayout from "../components/DashboardLayout";
import { fetchMyFavorites } from "../services/favorites";
import ProfessorEventCard from "../components/ProfessorEventCard";
import AttendedEvents from "./AttendedEvents";
import { Store, CalendarDays, MessageSquare, Vote, Dumbbell, ShoppingBag } from "lucide-react";
import LoyaltyVendors from "./LoyaltyVendors";
import AvailableBooths from "./AvailableBooths";
import EventsReviews from "./EventsReviews";
import VendorPolls from "../components/VendorPolls";
import Voting from "../components/Voting";
import TAChatbot from "../components/TAChatbot";
const TADashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("events");
  const [eventsTab, setEventsTab] = useState("upcoming"); // "upcoming", "registered", "favorites", "attended"
  const [favorites, setFavorites] = useState([]);
  const [favSet, setFavSet] = useState(new Set());
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const favs = await fetchMyFavorites();
        setFavorites(favs);
        setFavSet(new Set(favs.map((e) => e._id || e.id)));
      } catch (err) {
        console.error("Error fetching TA dashboard data:", err);
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

  const sidebarItems = [
    { key: "events", label: "Events", icon: CalendarDays, onClick: () => setActiveSection("events") },
    { key: "eventsReviews", label: "Events Reviews", icon: MessageSquare, onClick: () => setActiveSection("eventsReviews") },
    { key: "boothPolls", label: "Booth Polls", icon: Vote, onClick: () => setActiveSection("boothPolls") },
    { key: "availableBooths", label: "Available Booths", icon: ShoppingBag, onClick: () => setActiveSection("availableBooths") },
    { key: "loyaltyVendors", label: "Loyalty Vendors", icon: Store, onClick: () => setActiveSection("loyaltyVendors") },
    { key: "gymSchedule", label: "Gym Schedule", icon: Dumbbell, onClick: () => setActiveSection("gymSchedule") },
  ];

  return (
    <DashboardLayout
      dashboardTitle="TA Dashboard"
      roleLabel="Teaching Assistant"
      roleColor="bg-green-500"
      sidebarItems={sidebarItems}
      activeKey={activeSection}
    >
      <TAChatbot onNavigate={setActiveSection} />
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
                          userRole="ta"
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
                          userRole="ta"
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

        {/* Available Booths Section */}
        {activeSection === "availableBooths" && (
          <AvailableBooths showActions={false} />
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

export default TADashboard;

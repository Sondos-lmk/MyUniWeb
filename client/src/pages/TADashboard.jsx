import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UpcomingEvents from "../components/UpcomingEvents";
import MyRegisteredEvents from "./MyRegisteredEvents";
import RegisterForEvent from "./RegisterForEvent";
import GymSchedule from "./GymSchedule";
import DashboardLayout from "../components/DashboardLayout";
import { fetchMyFavorites } from "../services/favorites";
import EventCard from "../components/EventCard";
import AttendedEvents from "./AttendedEvents";

// ⭐ ADD THIS (missing in second code)
import Voting from "../components/Voting";

const TADashboard = () => {
  const [activeTab, setActiveTab] = useState("events");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favSet, setFavSet] = useState(new Set());
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
        const res = await axios.get(`${apiUrl}/api/events/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingEvents(res.data.events || []);

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

    fetchEvents();
  }, [navigate]);

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
    { key: "events", label: "Upcoming Events", icon: null, onClick: () => setActiveTab("events") },
    { key: "registered", label: "My Registered Events", icon: null, onClick: () => setActiveTab("registered") },
    { key: "favorites", label: "Favorites", icon: null, onClick: () => setActiveTab("favorites") },
    { key: "attended", label: "Attended Events", icon: null, onClick: () => setActiveTab("attended") },
    { key: "register", label: "Register for Event", icon: null, onClick: () => setActiveTab("register") },
    { key: "gym", label: "Gym Schedule", icon: null, onClick: () => setActiveTab("gym") },
    { key: "vendors", label: "Loyalty Vendors", icon: null, onClick: () => setActiveTab("vendors") },
  ];

  return (
    <DashboardLayout
      dashboardTitle="TA Dashboard"
      roleLabel="Teaching Assistant"
      roleColor="bg-green-500"
      sidebarItems={sidebarItems}
      activeKey={activeTab}
    >

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded ${
            activeTab === "events"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Upcoming Events
        </button>

        <button
          onClick={() => setActiveTab("registered")}
          className={`px-4 py-2 rounded ${
            activeTab === "registered"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          My Registered Events
        </button>

        <button
          onClick={() => setActiveTab("favorites")}
          className={`px-4 py-2 rounded ${
            activeTab === "favorites"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Favorites
        </button>

        <button
          onClick={() => setActiveTab("attended")}
          className={`px-4 py-2 rounded ${
            activeTab === "attended"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Attended Events
        </button>

        <button
          onClick={() => setActiveTab("register")}
          className={`px-4 py-2 rounded ${
            activeTab === "register"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Register for Event
        </button>

        <button
          onClick={() => setActiveTab("gym")}
          className={`px-4 py-2 rounded ${
            activeTab === "gym"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Gym Schedule
        </button>

        <button
          onClick={() => setActiveTab("vendors")}
          className={`px-4 py-2 rounded ${
            activeTab === "vendors"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Loyalty Vendors
        </button>
      </div>

      {/* EVENTS VIEW */}
      {activeTab === "events" && (
        <div className="mt-6">
          <UpcomingEvents
            favoritesSet={favSet}
            onToggleFavorite={handleToggleFavorite}
            userRole="student"
          />

          {/* ⭐ ADD THIS (from first code) */}
          <Voting />
        </div>
      )}

      {/* Registered Events */}
      {activeTab === "registered" && (
        <div className="mt-6">
          <MyRegisteredEvents />
        </div>
      )}

      {/* Favorites */}
      {activeTab === "favorites" && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-center mb-4">
            My Favorites
          </h2>

          {favorites.length === 0 ? (
            <p className="text-center text-gray-600">
              No favorite events yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {favorites.map((ev) => {
                const id = ev._id || ev.id;
                return (
                  <EventCard
                    key={id}
                    event={ev}
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

      {/* Attended */}
      {activeTab === "attended" && (
        <div className="mt-6">
          <AttendedEvents />
        </div>
      )}

      {/* Register for Event */}
      {activeTab === "register" && (
        <div className="mt-6">
          <RegisterForEvent />
        </div>
      )}

      {/* Gym */}
      {activeTab === "gym" && (
        <div className="mt-6">
          <GymSchedule />
        </div>
      )}

      {/* Vendors */}
      {activeTab === "vendors" && (
        <div className="mt-6">
          <a
            href="/loyalty-vendors"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            View Loyalty Vendors
          </a>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TADashboard;

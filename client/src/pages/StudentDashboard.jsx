import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import UpcomingEvents from "../components/UpcomingEvents";
import MyRegisteredEvents from "./MyRegisteredEvents";
import RegisterForEvent from "./RegisterForEvent";
import GymSchedule from "./GymSchedule";
import api from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import AttendedEvents from "./AttendedEvents";
import VendorPolls from "../components/VendorPolls";

// Favorites imports
import { fetchMyFavorites } from "../services/favorites";
import EventCard from "../components/EventCard";
import { useAuth } from "../context/AuthContext";
import { Calendar, CheckCircle, Star, Home, Trophy, Dumbbell, Store, Heart, Clock } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import LoyaltyVendors from "./LoyaltyVendors";

const StudentDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("home"); 
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

  const navigate = useNavigate();
  const { user } = useAuth();

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

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "gym") {
      fetchGymSessions();
    }
  }, [activeTab]);

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
    { 
      key: "events",
      label: "Upcoming Events", 
      icon: Calendar,
      onClick: () => setActiveTab("events"),
      path: "/student/dashboard"
    },
    { 
      key: "registered",
      label: "My Registered Events", 
      icon: CheckCircle,
      onClick: () => setActiveTab("registered"),
      path: "/student/dashboard"
    },
    { 
      key: "favorites",
      label: "Favorites", 
      icon: Star,
      onClick: () => setActiveTab("favorites"),
      path: "/student/dashboard"
    },
    { 
      key: "attended",
      label: "Attended Events", 
      icon: Heart,
      onClick: () => setActiveTab("attended"),
      path: "/student/dashboard"
    },
    { 
      key: "courts",
      label: "View Courts", 
      icon: Trophy,
      onClick: () => {
        setActiveTab("courts");
        fetchCourts();
      },
      path: "/student/dashboard"
    },
    {
      key: "loyaltyVendors",
      label: "Loyalty Vendors",
      icon: Store,
      onClick: () => setActiveTab("loyaltyVendors"),
      path: "/student/dashboard"
    },
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
      activeKey={activeTab}
    >

      {/* DEFAULT HOME VIEW - Quick Actions and Vendor Polls */}
      {activeTab === "home" && (
        <div className="mt-6">
          {/* Quick Actions Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Register for Event Card */}
              <button
                onClick={() => setActiveTab("register")}
                className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-cyan-500 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">
                      Register for Event
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Sign up for workshops and trips
                    </p>
                  </div>
                </div>
              </button>
              {/* Gym Schedule Card */}
              <button
                onClick={() => setActiveTab("gym")}
                className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-cyan-500 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">
                      Gym Schedule
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Book your fitness sessions
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Vendor Polls Section */}
          <VendorPolls />
        </div>
      )}

      {/* UPCOMING EVENTS - Only shown when clicking from sidebar */}
      {activeTab === "events" && (
        <div className="mt-6">
          <UpcomingEvents
            favoritesSet={favSet}
            onToggleFavorite={handleToggleFavorite}
            userRole="student"
          />
        </div>
      )}

      {/* MY REGISTERED EVENTS */}
      {activeTab === "registered" && (
        <div className="mt-6">
          <MyRegisteredEvents />
        </div>
      )}

      {/* FAVORITES TAB */}
      {activeTab === "favorites" && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-center mb-4">My Favorites</h2>
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

      {/* ATTENDED EVENTS */}
      {activeTab === "attended" && (
        <div className="mt-6">
          <AttendedEvents />
        </div>
      )}

      {/* REGISTER FOR EVENT */}
      {activeTab === "register" && (
        <div className="mt-6">
          <RegisterForEvent />
        </div>
      )}

      {/* COURTS */}
      {activeTab === "courts" && (
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

      {/* GYM TAB */}
      {activeTab === "gym" && (
        <div className="mt-6">
          <h2 className="mb-6 text-center">Gym Schedule</h2>
          {loadingGym ? (
            <p className="text-center">Loading sessions...</p>
          ) : gymSessions.length === 0 ? (
            <p className="text-center text-slate-600">No gym sessions available.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gymSessions.map((session) => {
                const participantsCount = session.participants?.length || 0;
                const isFull = participantsCount >= session.maxParticipants;
                const userId = user?.id || user?._id;
                const isRegistered = session.participants?.some(
                  (p) => String(p._id || p) === String(userId)
                );

                // Format time
                const timeDisplay = session.time || `${session.startTime || "—"} - ${session.endTime || "—"}`;

                return (
                  <Card key={session._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Dumbbell className="size-8 text-blue-600" />
                        <Badge
                          variant={isFull ? "destructive" : "secondary"}
                          className={isFull ? "bg-red-100 text-red-700" : ""}
                        >
                          {participantsCount}/{session.maxParticipants}
                        </Badge>
                      </div>
                      <h3 className="text-slate-900 mb-2 font-semibold">
                        {session.title || session.sessionType || "Gym Session"}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-600 mb-4">
                        <Clock className="size-4" />
                        <span className="text-sm">{timeDisplay}</span>
                      </div>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isFull || isRegistered || registeringId === session._id}
                        onClick={() => handleGymRegister(session._id)}
                      >
                        {isRegistered
                          ? "Registered"
                          : isFull
                          ? "Full"
                          : registeringId === session._id
                          ? "Registering..."
                          : "Register"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LOYALTY VENDORS */}
      {activeTab === "loyaltyVendors" && (
        <div className="mt-6">
          <LoyaltyVendors />
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;

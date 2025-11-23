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

// ⭐ ADDED FROM FIRST CODE
import Voting from "../components/Voting";

// Favorites imports
import { fetchMyFavorites } from "../services/favorites";
import EventCard from "../components/EventCard";
import { Calendar, CheckCircle, Star, Home, Trophy, Dumbbell, Store, Heart } from "lucide-react";

const StudentDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("events"); 
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [error, setError] = useState("");
  const [lastBooking, setLastBooking] = useState(null);

  // Favorites
  const [favorites, setFavorites] = useState([]);
  const [favSet, setFavSet] = useState(new Set());

  const navigate = useNavigate();

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
      key: "register",
      label: "Register for Event", 
      icon: Home,
      onClick: () => setActiveTab("register"),
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
      key: "gym",
      label: "Gym Schedule", 
      icon: Dumbbell,
      onClick: () => setActiveTab("gym"),
      path: "/student/dashboard"
    },
    { 
      key: "vendors",
      label: "Loyalty Vendors", 
      icon: Store,
      onClick: () => setActiveTab("vendors"),
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

      {/* UPCOMING EVENTS */}
      {activeTab === "events" && (
        <div className="mt-6">
          <UpcomingEvents
            favoritesSet={favSet}
            onToggleFavorite={handleToggleFavorite}
            userRole="student"
          />

          {/* ⭐ ADDED FROM FIRST CODE */}
          <Voting />
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

      {/* COURTS TAB */}
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
          <GymSchedule />
        </div>
      )}

      {/* LOYALTY VENDORS TAB */}
      {activeTab === "vendors" && (
        <div className="mt-6">
          <Link
            to="/loyalty-vendors"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            View Loyalty Vendors
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;

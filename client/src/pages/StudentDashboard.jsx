import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import UpcomingEvents from "../components/UpcomingEvents";
import MyRegisteredEvents from "./MyRegisteredEvents";
import GymSchedule from "./GymSchedule";
import api from "../services/api";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import AttendedEvents from "./AttendedEvents";
import VendorPolls from "../components/VendorPolls";
import StudentChatbot from "../components/StudentChatbot";
// Favorites imports
import { fetchMyFavorites } from "../services/favorites";
import ProfessorEventCard from "../components/ProfessorEventCard";
import { useAuth } from "../context/AuthContext";
import ClubCard from "../components/ClubCard";
import CreateClubModal from "../components/CreateClubModal";
import ApplyToClubModal from "../components/ApplyToClubModal";
import RejectApplicationModal from "../components/RejectApplicationModal";
import {
  Calendar,
  CheckCircle,
  Home,
  Trophy,
  Dumbbell,
  Store,
  CalendarDays,
  MessageSquare,
  Vote,
  ShoppingBag,
} from "lucide-react";
import LoyaltyVendors from "./LoyaltyVendors";
import EventsReviews from "./EventsReviews";
import AvailableBooths from "./AvailableBooths";
import ModernAlert from "../components/ui/ModernAlert";

const StudentDashboard = () => {
  const { user, loading } = useAuth();

  // 🔒 Prevent the dashboard from rendering before user + roles are ready
  if (loading || !user || !user.clubRoles) {
    return (
      <div className="p-6 text-center text-lg">
        Loading dashboard...
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-center text-lg">Loading...</div>;
  }

  if (!user) {
    return <div className="p-6 text-center text-red-600">No user found</div>;
  }


  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("events");
  const [eventsTab, setEventsTab] = useState("upcoming"); // "upcoming", "registered", "favorites", "attended"

  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false);
  const [myApplications, setMyApplications] = useState([]);

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  // ====== EVENTS & FAVORITES STATE ======
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);

  // Favorites
  const [favorites, setFavorites] = useState([]);
  const [favSet, setFavSet] = useState(new Set());

  // Events management
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // ====== GYM STATE ======
  const [gymSessions, setGymSessions] = useState([]);
  const [loadingGym, setLoadingGym] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  // ====== COURTS STATE ======
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [error, setError] = useState("");
  const [lastBooking, setLastBooking] = useState(null);

  // ====== CLUBS BASE (All clubs + my creation requests) ======
  const [clubsTab, setClubsTab] = useState("all"); // "all" | "requests"
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [clubError, setClubError] = useState("");
  const [clubForm, setClubForm] = useState({ name: "", desc: "", reason: "" });
  const [submittingClub, setSubmittingClub] = useState(false);
  const [myClubRequests, setMyClubRequests] = useState([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);
  const getClubStatus = (clubId) => {
    // 1️⃣ If user is president → auto accepted
    if (user?.clubRoles?.presidentOf?.some(c => c._id === clubId)) {
      return "accepted";
    }

    // 2️⃣ If user is HR → auto accepted
    if (user?.clubRoles?.hrMemberOf?.some(c => c._id === clubId)) {
      return "accepted";
    }

    // 3️⃣ Otherwise check application status
    const app = myApplications.find(a =>
      a.clubId === clubId ||
      a.club?._id === clubId ||
      a.club === clubId
    );

    return app?.status || null;
  };



// ====== CLUB APPLICATION POPUPS ======
const [applyModalOpen, setApplyModalOpen] = useState(false);
const [rejectModalOpen, setRejectModalOpen] = useState(false);

// Store what the user is applying *to*
const [selectedClub, setSelectedClub] = useState(null);

// Store what application the president is rejecting
const [selectedApplication, setSelectedApplication] = useState(null);



  // ====== CLUB APPLICATIONS (for president / HR) ======
  const [selectedManagedClubId, setSelectedManagedClubId] = useState("");
  const [clubApplications, setClubApplications] = useState([]);
  const [loadingClubApps, setLoadingClubApps] = useState(false);

  // ====== HR MANAGEMENT (president only) ======
  const [selectedPresidentClubId, setSelectedPresidentClubId] = useState("");
  const [hrInput, setHrInput] = useState(""); // comma-separated user IDs
  const [managedMembers, setManagedMembers] = useState([]);
  const [selectedHr, setSelectedHr] = useState([]);
  // ====== FETCH GYM SESSIONS ======
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

  const handleGymRegister = async (sessionId) => {
    try {
      setRegisteringId(sessionId);
      await api.post(`/gym/${sessionId}/register`);
      fetchGymSessions(); // Refresh
    } catch (err) {
      console.error("Error registering for gym session:", err);
      showAlert(
        err.response?.data?.message || "Failed to register for session",
        "error"
      );
    } finally {
      setRegisteringId(null);
    }
  };

  // ====== INITIAL FETCH: UPCOMING, MY EVENTS, FAVS ======
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:4000";

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

  useEffect(() => {
  const loadApps = async () => {
    try {
      const res = await API.get("/clubs/my/applications");
      setMyApplications(res.data.applications || []);
    } catch (err) {
      console.error("Failed to load my applications:", err);
    }
  };
  loadApps();
}, []);


  // ====== LOAD ALL EVENTS WHEN EVENTS SECTION IS ACTIVE ======
  useEffect(() => {
    if (activeSection === "events") {
      fetchEvents();
    }
  }, [activeSection]);

  const fetchEvents = async () => {
    setLoadingEvents(true);
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
      setLoadingEvents(false);
    }
  };

  // ====== CLUB HELPERS (BACKEND CALLS) ======

  // Load all clubs (cards)
  async function loadClubs() {
    try {
      setLoadingClubs(true);
      setClubError("");
      const res = await API.get("/clubs");
      const payload = Array.isArray(res.data?.clubs)
        ? res.data.clubs
        : Array.isArray(res.data)
        ? res.data
        : [];
      setClubs(payload);
    } catch (err) {
      console.error("Failed to load clubs", err);
      setClubError(err.response?.data?.message || "Failed to load clubs");
    } finally {
      setLoadingClubs(false);
    }
  }

  // Load my club creation requests
  async function loadMyClubRequests() {
    try {
      setLoadingMyRequests(true);
      const res = await API.get("/clubs/my/requests");
      const payload = Array.isArray(res.data?.requests)
        ? res.data.requests
        : Array.isArray(res.data)
        ? res.data
        : [];
      setMyClubRequests(payload);
    } catch (err) {
      console.error("Failed to load my club requests", err);
    } finally {
      setLoadingMyRequests(false);
    }
  }

  // Whenever we go to any club-related section, ensure clubs (and requests) are loaded
  useEffect(() => {
    if (
      activeSection === "clubs" ||
      activeSection === "club-applications" ||
      activeSection === "hr-management"
    ) {
      loadClubs();
      if (activeSection === "clubs") {
        loadMyClubRequests();
      }
    }
  }, [activeSection]);

  // Apply to a club
const handleApplyToClub = (club) => {
  setSelectedClub(club);
  setApplyModalOpen(true);
};

const submitApplication = async (formData) => {
  try {
    await API.post(`/clubs/${selectedClub._id}/apply`, formData);
    showAlert("Application submitted!", "success");
    setApplyModalOpen(false);
    loadClubs();
    loadMyClubRequests();
  } catch (err) {
    showAlert(err.response?.data?.message || "Failed to apply", "error");
  }
};



  // Submit a new club creation request
  const handleClubFormChange = (e) => {
    const { name, value } = e.target;
    setClubForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitClubRequest = async (e) => {
    e.preventDefault();
    const { name, desc, reason } = clubForm;
    if (!name.trim() || !desc.trim() || !reason.trim()) {
      showAlert("Please fill in all fields for the club request.", "error");
      return;
    }

    try {
      setSubmittingClub(true);
      const res = await API.post("/clubs/requests", { name, desc, reason });
      showAlert(
        res.data?.message || "Club creation request submitted.",
        "success"
      );
      setClubForm({ name: "", desc: "", reason: "" });
      await loadMyClubRequests();
      setClubsTab("requests");
    } catch (err) {
      console.error("Error submitting club request:", err);
      showAlert(
        err.response?.data?.message || "Failed to submit club request",
        "error"
      );
    } finally {
      setSubmittingClub(false);
    }
  };

  // ====== CLUB APPLICATIONS (PRESIDENT / HR) ======

  // pick a default managed club from user's clubRoles
  useEffect(() => {
    if (!user?.clubRoles) return;
    if (selectedManagedClubId) return;

    const roles = user.clubRoles;
    const first =
      (roles.presidentOf && roles.presidentOf[0]) ||
      (roles.hrMemberOf && roles.hrMemberOf[0]);

    if (first) setSelectedManagedClubId(first._id);
  }, [user, selectedManagedClubId]);

  const managedClubs = useMemo(() => {
    if (!user?.clubRoles) return [];
    const roles = user.clubRoles;
    const list = [];

    (roles.presidentOf || []).forEach((c) =>
      list.push({ ...c, myRole: "President" })
    );
    (roles.hrMemberOf || []).forEach((c) =>
      list.push({ ...c, myRole: "HR" })
    );

    // dedupe by _id
    const seen = new Set();
    return list.filter((c) => {
      if (seen.has(c._id)) return false;
      seen.add(c._id);
      return true;
    });
  }, [user]);

  const loadClubApplicationsFor = async (clubId) => {
    if (!clubId) return;
    try {
      setLoadingClubApps(true);
      const res = await API.get(`/clubs/${clubId}/applications`);
      const payload = Array.isArray(res.data?.applications)
        ? res.data.applications
        : Array.isArray(res.data)
        ? res.data
        : [];
      setClubApplications(payload);
    } catch (err) {
      console.error("Failed to load club applications:", err);
      showAlert(
        err.response?.data?.message || "Failed to load applications",
        "error"
      );
    } finally {
      setLoadingClubApps(false);
    }
  };

  useEffect(() => {
    if (activeSection === "club-applications" && selectedManagedClubId) {
      loadClubApplicationsFor(selectedManagedClubId);
    }
  }, [activeSection, selectedManagedClubId]);

  const handleAcceptApplication = async (appId) => {
    try {
      await API.patch(`/clubs/applications/${appId}/accept`, {
        reviewMessage: "",
      });
      showAlert("Application accepted.", "success");
      loadClubApplicationsFor(selectedManagedClubId);
    } catch (err) {
      console.error("Error accepting application:", err);
      showAlert(
        err.response?.data?.message || "Failed to accept application",
        "error"
      );
    }
  };

const handleRejectApplication = (application) => {
  setSelectedApplication(application);
  setRejectModalOpen(true);
};

const submitRejection = async (reason) => {
  try {
    await API.patch(`/clubs/applications/${selectedApplication._id}/reject`, {
      reviewMessage: reason,
    });
    setRejectModalOpen(false);
    loadClubApplicationsFor(selectedManagedClubId);
    showAlert("Application rejected.", "success");
  } catch (err) {
    showAlert("Failed to reject application", "error");
  }
};

  // ====== HR MANAGEMENT (PRESIDENT ONLY) ======

  // default selected president club
  useEffect(() => {
    if (!user?.clubRoles?.isPresident) return;
    if (selectedPresidentClubId) return;
    const first = user.clubRoles.presidentOf?.[0];
    if (first) setSelectedPresidentClubId(first._id);
  }, [user, selectedPresidentClubId]);

  // prefill hrInput when club changes
  useEffect(() => {
    if (!selectedPresidentClubId || !clubs.length) return;
    const club = clubs.find((c) => c._id === selectedPresidentClubId);
    if (!club) return;
    const ids = (club.hrMembers || []).map(
      (m) => m._id || m.id || m // populated or raw ObjectId
    );
    setHrInput(ids.join(","));
  }, [selectedPresidentClubId, clubs]);

const handleSaveHrMembers = async () => {
  try {
    await API.patch(`/clubs/${selectedPresidentClubId}/hr`, {
      hrMemberIds: selectedHr,
    });

    showAlert("HR members updated successfully.", "success");
    await loadClubs();
  } catch (err) {
    console.error(err);
    showAlert("Failed to update HR members", "error");
  }
};
useEffect(() => {
  if (!selectedPresidentClubId) return;

  async function loadMembers() {
    try {
      const res = await API.get(
        `/clubs/${selectedPresidentClubId}/members`
      );

      const members = res.data.members || [];
      setManagedMembers(members);

      // ✅ PRE-TICK existing HR members
      const hrIds = members
        .filter(m => m.isHr === true)
        .map(m => m._id);

      setSelectedHr(hrIds);
      console.log("members:", members);
      console.log("selectedHr:", hrIds);
    } catch (err) {
      console.error("Failed to load members:", err);
    }
  }

  loadMembers();
}, [selectedPresidentClubId]);



  // ====== EVENTS FILTERING ======
  const getEventStart = (event) => event.startDate || event.date;
  const getEventEnd = (event) => event.endDate || event.date;

  const filteredEvents = useMemo(() => {
    const now = new Date();
    let list = events.filter((event) => {
      const start = getEventStart(event);
      if (!start) return false;
      const startDate = new Date(start);
      if (Number.isNaN(startDate.getTime())) return false;
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

  // Favorites toggle
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

  // ====== COURTS HELPERS ======
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
      showAlert(err.response?.data?.message || "Booking failed", "error");
    }
  };

  // ====== SIDEBAR ITEMS (ROLE-AWARE) ======
const sidebarItems = useMemo(() => {
  const items = [
    {
      key: "events",
      label: "Events",
      icon: CalendarDays,
      onClick: () => setActiveSection("events"),
    },
    {
      key: "clubs",
      label: "Clubs",
      icon: Home,
      onClick: () => setActiveSection("clubs"),
    },
    {
      key: "eventsReviews",
      label: "Events Reviews",
      icon: MessageSquare,
      onClick: () => setActiveSection("eventsReviews"),
    },
    {
      key: "boothPolls",
      label: "Booth Polls",
      icon: Vote,
      onClick: () => setActiveSection("boothPolls"),
    },
    {
      key: "availableBooths",
      label: "Available Booths",
      icon: ShoppingBag,
      onClick: () => setActiveSection("availableBooths"),
    },
    {
      key: "loyaltyVendors",
      label: "Loyalty Vendors",
      icon: Store,
      onClick: () => setActiveSection("loyaltyVendors"),
    },
    {
      key: "gymSchedule",
      label: "Gym Schedule",
      icon: Dumbbell,
      onClick: () => setActiveSection("gymSchedule"),
    },
    {
      key: "courts",
      label: "View Courts",
      icon: Trophy,
      onClick: () => {
        setActiveSection("courts");
        fetchCourts();
      },
    },
  ];

  // Add club roles dynamically
  if (user?.clubRoles?.isPresident || user?.clubRoles?.isHr) {
    items.push({
      key: "club-applications",
      label: "Club Applications",
      icon: Calendar,
      onClick: () => setActiveSection("club-applications"),
    });
  }

  if (user?.clubRoles?.isPresident) {
    items.push({
      key: "hr-management",
      label: "HR Management",
      icon: CheckCircle,
      onClick: () => setActiveSection("hr-management"),
    });
  }

  return items;
}, [user?.clubRoles]);

  return (
    <DashboardLayout
      dashboardTitle="Student Dashboard"
      roleLabel="Verified Student"
      roleColor="bg-green-500"
      sidebarItems={sidebarItems}
      activeKey={activeSection}
    >
      <StudentChatbot onNavigate={setActiveSection} />

      <div className="mt-6">
        {/* ========== EVENTS SECTION ========== */}
        {activeSection === "events" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Events Management</h2>

            <div className="border-b border-slate-200 mb-6 flex gap-4 flex-wrap">
              <button
                onClick={() => setEventsTab("upcoming")}
                className={`pb-3 px-2 text-sm font-semibold ${
                  eventsTab === "upcoming"
                    ? "text-cyan-600 border-b-2 border-cyan-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setEventsTab("registered")}
                className={`pb-3 px-2 text-sm font-semibold ${
                  eventsTab === "registered"
                    ? "text-cyan-600 border-b-2 border-cyan-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                My Registrations
              </button>
              <button
                onClick={() => setEventsTab("favorites")}
                className={`pb-3 px-2 text-sm font-semibold ${
                  eventsTab === "favorites"
                    ? "text-cyan-600 border-b-2 border-cyan-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Favorites
              </button>
              <button
                onClick={() => setEventsTab("attended")}
                className={`pb-3 px-2 text-sm font-semibold ${
                  eventsTab === "attended"
                    ? "text-cyan-600 border-b-2 border-cyan-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Attended Events
              </button>
            </div>

            {eventsTab === "upcoming" && (
              <div>
                {/* Filters */}
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

                {/* Events grid */}
                {loadingEvents ? (
                  <p className="text-center text-slate-600">
                    Loading events...
                  </p>
                ) : filteredEvents.length === 0 ? (
                  <p className="text-center text-slate-600">
                    No upcoming events found.
                  </p>
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

            {eventsTab === "registered" && <MyRegisteredEvents />}

            {eventsTab === "favorites" && (
              <div>
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

            {eventsTab === "attended" && <AttendedEvents />}
          </div>
        )}

        {/* ========== CLUBS BASE SECTION (ALL STUDENTS) ========== */}
        {activeSection === "clubs" && (
          <div>
            {/* Header row with create button */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Clubs</h2>
              <button
                onClick={() => setIsCreateClubModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-sm font-semibold hover:from-cyan-700 hover:to-blue-800"
              >
                + Create Club
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-6 flex gap-4 flex-wrap">
              <button
                onClick={() => setClubsTab("all")}
                className={`pb-3 px-2 text-sm font-semibold ${
                  clubsTab === "all"
                    ? "text-cyan-600 border-b-2 border-cyan-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Clubs
              </button>

              <button
                onClick={() => setClubsTab("requests")}
                className={`pb-3 px-2 text-sm font-semibold ${
                  clubsTab === "requests"
                    ? "text-cyan-600 border-b-2 border-cyan-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                My Club Requests
              </button>
            </div>

            {/* ---- All Clubs Tab ---- */}
            {clubsTab === "all" && (
              <div className="space-y-8">
                {/* Clubs cards */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Available Clubs</h3>

                  {clubError && (
                    <p className="text-red-600 mb-4">{clubError}</p>
                  )}

                  {loadingClubs ? (
                    <p className="text-center text-slate-600">Loading clubs...</p>
                  ) : clubs.length === 0 ? (
                    <p className="text-slate-600">
                      No clubs available yet. Be the first to submit a club idea!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {clubs.map((club) => (
                      <ClubCard
                        key={club._id}
                        club={club}
                        applicationStatus={getClubStatus(club._id)}
                        onApply={() => handleApplyToClub(club)}
                      />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---- My Club Requests Tab ---- */}
            {clubsTab === "requests" && (
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  My Club Creation Requests
                </h3>

                {loadingMyRequests ? (
                  <p className="text-center text-slate-600">
                    Loading your requests...
                  </p>
                ) : myClubRequests.length === 0 ? (
                  <p className="text-slate-600">
                    You don't have any club requests yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {myClubRequests.map((r) => (
                      <div
                        key={r._id}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-lg font-semibold">{r.name}</h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              r.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : r.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {r.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          {r.desc}
                        </p>
                        <p className="text-xs text-slate-500 mb-1">
                          Reason: {r.reason}
                        </p>
                        {r.status === "rejected" && r.rejectionReason && (
                          <p className="text-xs text-red-600">
                            Rejection Reason: {r.rejectionReason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========== CLUB APPLICATIONS (PRESIDENT / HR) ========== */}
        {activeSection === "club-applications" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Club Applications</h2>

            {managedClubs.length === 0 ? (
              <p className="text-slate-600">
                You are not a president or HR member of any club yet.
              </p>
            ) : (
              <>
                <div className="mb-4 flex gap-3 items-center">
                  <span className="text-sm text-slate-600">Managing:</span>
                  <select
                    value={selectedManagedClubId}
                    onChange={(e) => setSelectedManagedClubId(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {managedClubs.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.myRole})
                      </option>
                    ))}
                  </select>
                </div>

                {loadingClubApps ? (
                  <p className="text-center text-slate-600">
                    Loading applications...
                  </p>
                ) : clubApplications.length === 0 ? (
                  <p className="text-slate-600">
                    No applications yet for this club.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {clubApplications.map((app) => (
                      <div
                        key={app._id}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="font-semibold">
                              {app.student?.name || app.student?.email}
                            </p>
                            <p className="text-xs text-slate-500">
                              {app.student?.email}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              app.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : app.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {app.status.toUpperCase()}
                          </span>
                        </div>
                        {app.motivation && (
                          <div className="text-sm text-slate-700 mb-2 space-y-1">

                            {app.name && (
                              <p><span className="font-semibold">Full Name:</span> {app.name}</p>
                            )}

                            {app.gucId && (
                              <p><span className="font-semibold">GUC ID:</span> {app.gucId}</p>
                            )}

                            {app.phone && (
                              <p><span className="font-semibold">Phone:</span> {app.phone}</p>
                            )}

                            {app.motivation && (
                              <p>
                                <span className="font-semibold">Motivation:</span> {app.motivation}
                              </p>
                            )}

                          </div>
                        )}
                        {app.reviewMessage && (
                          <p className="text-xs text-slate-500 mb-2">
                            Review Note: {app.reviewMessage}
                          </p>
                        )}

                        {app.status === "pending" && (
                          <div className="flex gap-3 mt-2">
                            <button
                              onClick={() =>
                                handleAcceptApplication(app._id)
                              }
                              className="px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleRejectApplication(app)
                              }
                              className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ========== HR MANAGEMENT (PRESIDENT ONLY) ========== */}
        {activeSection === "hr-management" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">HR Team Management</h2>

          {!user?.clubRoles?.isPresident ? (
            <p className="text-slate-600">
              You are not currently a president of any club.
            </p>
          ) : user.clubRoles.presidentOf?.length === 0 ? (
            <p className="text-slate-600">
              You are not currently a president of any club.
            </p>
          ) : (
            <>
              {/* SELECT CLUB */}
              <div className="mb-4 flex gap-3 items-center">
                <span className="text-sm text-slate-600">Club:</span>
                <select
                  value={selectedPresidentClubId}
                  onChange={(e) => setSelectedPresidentClubId(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {user.clubRoles.presidentOf.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* MEMBERS CHECKBOXES */}
              <h3 className="text-lg font-semibold mb-2">Assign HR Members</h3>

              <div className="space-y-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                {managedMembers.length === 0 ? (
                  <p className="text-sm text-slate-500">No members yet.</p>
                ) : (
                  managedMembers.map((m) => (
                    <label
                      key={m._id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedHr.includes(m._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHr(prev => [...prev, m._id]);
                          } else {
                          setSelectedHr(prev =>
                            prev.filter(id => id !== m._id)
                          );
                          }
                        }}
                      />
                      <span>{m.name || m.email}</span>
                    </label>
                  ))
                )}
              </div>

              <button
                onClick={handleSaveHrMembers}
                className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-semibold hover:from-cyan-700 hover:to-blue-800"
              >
                Save HR Members
              </button>
            </>
          )}
        </div>
      )}


        {/* ========== OTHER EXISTING SECTIONS ========== */}
        {activeSection === "eventsReviews" && <EventsReviews />}

        {activeSection === "boothPolls" && (
          <div>
            <VendorPolls />
          </div>
        )}

        {activeSection === "availableBooths" && (
          <AvailableBooths showActions={false} />
        )}

        {activeSection === "courts" && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-4">
              Campus Courts
            </h2>

            {error && (
              <p className="text-red-600 text-center mb-2">{error}</p>
            )}

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
                    <p className="text-sm text-gray-500">
                      {court.location}
                    </p>
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
                              onClick={() => {
                                if (!slot.booked) {
                                  bookCourt(
                                    selectedCourt,
                                    day.date,
                                    slot.startTime,
                                    slot.endTime
                                  );
                                }
                              }}
                              className={`mt-2 mx-auto w-fit px-6 py-2 rounded-md shadow ${
                                slot.booked
                                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                  : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                              }`}
                            >
                              <div className="font-semibold text-center">
                                {slot.startTime} - {slot.endTime}
                              </div>

                              {slot.booked && (
                                <div className="text-sm text-center mt-1">
                                  Booked By: {slot.studentName}, ID:{" "}
                                  {slot.studentGucId}
                                </div>
                              )}
                            </div>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">
                          No available slots
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === "gymSchedule" && <GymSchedule />}

        {activeSection === "loyaltyVendors" && <LoyaltyVendors />}
      </div>

      {/* Global alert */}
      <ModernAlert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />
          <CreateClubModal
      open={isCreateClubModalOpen}
      onClose={() => setIsCreateClubModalOpen(false)}
      onCreated={async () => {
        await loadMyClubRequests();
        await loadClubs();
      }}
    />
    {applyModalOpen && selectedClub && (
      <ApplyToClubModal
        open={applyModalOpen}
        club={selectedClub}
        onClose={() => setApplyModalOpen(false)}
        onSubmit={submitApplication}
      />
    )}

    {rejectModalOpen && selectedApplication && (
      <RejectApplicationModal
        open={rejectModalOpen}
        application={selectedApplication}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={submitRejection}
      />
    )}
    </DashboardLayout>
  );
};

export default StudentDashboard;

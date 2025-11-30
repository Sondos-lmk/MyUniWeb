
// import { useEffect, useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import RegisterForEvent from "./RegisterForEvent";
// import UpcomingEvents from "../components/UpcomingEvents";
// import MyRegisteredEvents from "./MyRegisteredEvents";
// import GymSchedule from "./GymSchedule";
// import CreateWorkshop from "./CreateWorkshop";
// import { fetchMyFavorites } from "../services/favorites";
// import EventCard from "../components/EventCard";
// import AttendedEvents from "./AttendedEvents";
// import EventsReviews from "./EventsReviews";
// import DashboardLayout from "../components/DashboardLayout";
// import Voting from "../components/Voting";
// import LoyaltyVendors from "./LoyaltyVendors";
// import ProfessorEventCard from "../components/ProfessorEventCard";
// import VendorPolls from "../components/VendorPolls";
// import API from "../services/api";
// import { getMyWorkshops } from "../services/workshop";
// import { Store, Home, PenSquare, ClipboardList, Dumbbell, Calendar, CalendarDays, Vote, MessageSquare } from "lucide-react";

// function ProfessorDashboard() {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   // Favorites
//   const [favorites, setFavorites] = useState([]);
//   const [favSet, setFavSet] = useState(new Set());
//   const [activeSection, setActiveSection] = useState("overview");
//   const [activeQuickAction, setActiveQuickAction] = useState(null);
//   const [eventsTab, setEventsTab] = useState("upcoming"); // "upcoming", "registered", "favorites", "attended"
//   const [workshops, setWorkshops] = useState([]);
//   const [workshopsError, setWorkshopsError] = useState(null);

//   // Events state
//   const [events, setEvents] = useState([]);
//   const [loadingEvents, setLoadingEvents] = useState(false);
//   const [searchValue, setSearchValue] = useState("");
//   const [filterType, setFilterType] = useState("");
//   const [filterLocation, setFilterLocation] = useState("");
//   const [filterDate, setFilterDate] = useState("");
//   const [sortOrder, setSortOrder] = useState("asc");

//   // Tabs
//   const [activeTab] = useState("events");

//   const token = localStorage.getItem("token");

//   const quickActionClasses =
//     "w-full h-16 text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 flex items-center justify-center gap-2 text-white rounded-lg shadow";

//   const sidebarItems = [
//     { key: "overview", label: "Overview", icon: Home, onClick: () => setActiveSection("overview") },
//     { key: "events", label: "Events", icon: CalendarDays, onClick: () => setActiveSection("events") },
//     { key: "eventsReviews", label: "Events Reviews", icon: MessageSquare, onClick: () => setActiveSection("eventsReviews") },
//     { key: "boothPolls", label: "Booth Polls", icon: Vote, onClick: () => setActiveSection("boothPolls") },
//     { key: "gymSchedule", label: "Gym Schedule", icon: Dumbbell, onClick: () => setActiveSection("gymSchedule") },
//     { key: "loyaltyVendors", label: "Loyalty Vendors", icon: Store, onClick: () => setActiveSection("loyaltyVendors") },
//   ];

//   // Load favorites
//   useEffect(() => {
//     if (user?.role !== "professor") return;

//     (async () => {
//       try {
//         const favs = await fetchMyFavorites();
//         setFavorites(favs);
//         setFavSet(new Set(favs.map((e) => e._id || e.id)));
//       } catch (e) {
//         console.error("Error loading favorites:", e);
//       }
//     })();
//   }, [user?.role, token]);

//   // Load events when Events tab is active
//   useEffect(() => {
//     if (activeSection === "events") {
//       fetchEvents();
//     }
//   }, [activeSection]);

//   // Load workshops when myWorkshops quick action is active
//   useEffect(() => {
//     if (activeQuickAction === "myWorkshops") {
//       fetchMyWorkshops();
//     }
//   }, [activeQuickAction]);

//   const fetchMyWorkshops = async () => {
//     try {
//       const data = await getMyWorkshops();
//       setWorkshops(data?.workshops || []);
//       setWorkshopsError(null);
//     } catch (err) {
//       setWorkshopsError(err?.response?.data?.message || err.message);
//     }
//   };

//   const fetchEvents = async () => {
//     setLoadingEvents(true);
//     try {
//       const res = await API.get("/events/");
//       const payload = Array.isArray(res.data) ? res.data : res.data?.events || [];
//       setEvents(payload);
//     } catch (err) {
//       console.error("Failed to load events", err);
//       setEvents([]);
//     } finally {
//       setLoadingEvents(false);
//     }
//   };

//   // Filter and sort events
//   const getEventStart = (event) => event.startDate || event.date;
//   const getEventEnd = (event) => event.endDate || event.date;

//   const filteredEvents = useMemo(() => {
//     const now = new Date();
//     let list = events.filter((event) => {
//       const start = getEventStart(event);
//       if (!start) return false;
//       const startDate = new Date(start);
//       if (Number.isNaN(startDate.getTime())) return false;
//       // Exclude gym events
//       if (event.type === "gym") return false;
//       return startDate > now;
//     });

//     if (searchValue.trim()) {
//       const query = searchValue.toLowerCase();
//       list = list.filter((event) => {
//         const titleMatch = event.title?.toLowerCase().includes(query);
//         const descMatch = event.desc?.toLowerCase().includes(query);
//         return titleMatch || descMatch;
//       });
//     }

//     if (filterType) {
//       list = list.filter((event) => event.type === filterType);
//     }

//     if (filterLocation.trim()) {
//       const normalized = filterLocation.toLowerCase();
//       list = list.filter((event) =>
//         (event.location || event.locationInPlatform || "")
//           .toLowerCase()
//           .includes(normalized)
//       );
//     }

//     if (filterDate) {
//       const target = new Date(filterDate).toDateString();
//       list = list.filter((event) => {
//         const start = getEventStart(event);
//         const end = getEventEnd(event);
//         const startString = start ? new Date(start).toDateString() : "";
//         const endString = end ? new Date(end).toDateString() : "";
//         return startString === target || endString === target;
//       });
//     }

//     list.sort((a, b) => {
//       const startA = new Date(getEventStart(a));
//       const startB = new Date(getEventStart(b));
//       return sortOrder === "asc" ? startA - startB : startB - startA;
//     });

//     return list;
//   }, [events, searchValue, filterType, filterLocation, filterDate, sortOrder]);

//   const handleResetFilters = () => {
//     setSearchValue("");
//     setFilterType("");
//     setFilterLocation("");
//     setFilterDate("");
//     setSortOrder("asc");
//   };

//   // Handle Favorites
//   const handleToggleFavorite = (eventId, willBeFav, eventObj) => {
//     setFavSet((prev) => {
//       const s = new Set(prev);
//       if (willBeFav) s.add(eventId);
//       else s.delete(eventId);
//       return s;
//     });

//     setFavorites((prev) => {
//       if (willBeFav) {
//         return prev.some((e) => (e._id || e.id) === eventId)
//           ? prev
//           : [...prev, eventObj];
//       }
//       return prev.filter((e) => (e._id || e.id) !== eventId);
//     });
//   };

//   return (
//     <DashboardLayout
//       dashboardTitle="Professor Dashboard"
//       roleLabel="Professor"
//       roleColor="bg-green-500"
//       sidebarItems={sidebarItems}
//       activeKey={activeSection}
//     >
//       <div className="p-6">
//         {/* Overview Section */}
//         {activeSection === "overview" && (
//           <section className="mt-6">
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <button
//                   type="button"
//                   onClick={() => setActiveQuickAction(activeQuickAction === 'createWorkshop' ? null : 'createWorkshop')}
//                   className={`${quickActionClasses} ${activeQuickAction === 'createWorkshop' ? 'ring-2 ring-cyan-500' : ''}`}
//                 >
//                   <PenSquare className="w-5 h-5" />
//                   Create Workshop
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setActiveQuickAction(activeQuickAction === 'myWorkshops' ? null : 'myWorkshops')}
//                   className={`${quickActionClasses} ${activeQuickAction === 'myWorkshops' ? 'ring-2 ring-cyan-500' : ''}`}
//                 >
//                   <ClipboardList className="w-5 h-5" />
//                   My Workshops
//                 </button>
//               </div>
//             </div>

//             {/* Quick action content below buttons */}
//             {activeQuickAction === 'createWorkshop' && (
//               <div className="mt-6">
//                 <CreateWorkshop />
//               </div>
//             )}

//             {activeQuickAction === 'myWorkshops' && (
//               <div className="mt-6 bg-white rounded-xl shadow-md p-6">
//                 <h2 className="text-2xl font-bold mb-6">My Workshops</h2>
                
//                 {workshopsError && <div className="text-red-600 mb-4">{workshopsError}</div>}

//                 {workshops.length === 0 ? (
//                   <p className="text-gray-600">You haven't created any workshops yet.</p>
//                 ) : (
//                   <div className="space-y-4">
//                     {workshops.map((w) => (
//                       <div
//                         key={w._id}
//                         className="bg-gray-50 shadow p-4 rounded-lg border"
//                       >
//                         <h3 className="text-lg font-bold">{w.title}</h3>

//                         <p className="text-sm text-gray-600 mt-1">
//                           Status: {w.status} • Registration Deadline:{" "}
//                           {new Date(w.registrationDeadline).toLocaleString()}
//                         </p>

//                         {w.editRequest && w.status !== "approved" && (
//                           <p className="text-sm text-orange-600 mt-1">
//                             <strong>Requested edits:</strong> {w.editRequest}
//                           </p>
//                         )}

//                         <div className="flex gap-3 mt-3">
//                           <button
//                             onClick={() => navigate(`/professor/workshops/${w._id}/edit`)}
//                             className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
//                           >
//                             Edit
//                           </button>

//                           <button
//                             onClick={() => navigate(`/professor/workshops/${w._id}/participants`)}
//                             className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
//                           >
//                             Participants
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </section>
//         )}

//         {/* Events Section - Complete Event Management */}
//         {activeSection === "events" && (
//           <div className="mt-6">
//             <h1 className="text-3xl font-bold mb-6">Events Management</h1>

//             {/* Main Tabs: Upcoming | Registrations | Favorites | Attended */}
//             <div className="border-b border-slate-200 mb-6 flex gap-4 flex-wrap">
//               <button
//                 onClick={() => setEventsTab("upcoming")}
//                 className={`pb-3 px-2 text-sm font-semibold ${eventsTab === "upcoming" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-slate-600 hover:text-slate-900"}`}
//               >
//                 Upcoming Events
//               </button>
//               <button
//                 onClick={() => setEventsTab("registered")}
//                 className={`pb-3 px-2 text-sm font-semibold ${eventsTab === "registered" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-slate-600 hover:text-slate-900"}`}
//               >
//                 My Registrations
//               </button>
//               <button
//                 onClick={() => setEventsTab("favorites")}
//                 className={`pb-3 px-2 text-sm font-semibold ${eventsTab === "favorites" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-slate-600 hover:text-slate-900"}`}
//               >
//                 Favorites
//               </button>
//               <button
//                 onClick={() => setEventsTab("attended")}
//                 className={`pb-3 px-2 text-sm font-semibold ${eventsTab === "attended" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-slate-600 hover:text-slate-900"}`}
//               >
//                 Attended Events
//               </button>
//             </div>

//             {/* Upcoming Events Tab - Search, Filter, Sort, Register, Add to Favorites */}
//             {eventsTab === "upcoming" && (
//               <>
//                 {/* Search and Filter Controls */}
//                 <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">
//                   <input
//                     type="text"
//                     placeholder="Search by event or professor name..."
//                     value={searchValue}
//                     onChange={(e) => setSearchValue(e.target.value)}
//                     className="border border-slate-300 px-3 py-2 rounded-lg w-full md:w-1/3"
//                   />

//                   <select
//                     value={filterType}
//                     onChange={(e) => setFilterType(e.target.value)}
//                     className="border border-slate-300 px-3 py-2 rounded-lg"
//                   >
//                     <option value="">All Types</option>
//                     <option value="workshop">Workshop</option>
//                     <option value="trip">Trip</option>
//                     <option value="bazaar">Bazaar</option>
//                     <option value="conference">Conference</option>
//                   </select>

//                   <input
//                     placeholder="Filter by location"
//                     value={filterLocation}
//                     onChange={(e) => setFilterLocation(e.target.value)}
//                     className="border border-slate-300 px-3 py-2 rounded-lg"
//                   />

//                   <input
//                     type="date"
//                     value={filterDate}
//                     onChange={(e) => setFilterDate(e.target.value)}
//                     className="border border-slate-300 px-3 py-2 rounded-lg"
//                   />

//                   <select
//                     value={sortOrder}
//                     onChange={(e) => setSortOrder(e.target.value)}
//                     className="border border-slate-300 px-3 py-2 rounded-lg"
//                   >
//                     <option value="asc">Oldest First</option>
//                     <option value="desc">Newest First</option>
//                   </select>

//                   <button
//                     onClick={handleResetFilters}
//                     className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
//                   >
//                     Reset
//                   </button>
//                 </div>

//                 {/* Events Grid */}
//                 {loadingEvents ? (
//                   <p className="text-center text-slate-500 py-8">Loading events...</p>
//                 ) : filteredEvents.length === 0 ? (
//                   <div className="text-center py-12 bg-slate-50 rounded-lg">
//                     <p className="text-slate-600 text-lg">No events found matching your criteria.</p>
//                     <button
//                       onClick={handleResetFilters}
//                       className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
//                     >
//                       Clear Filters
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {filteredEvents.map((event) => {
//                       const eventId = event._id || event.id || `${event.title}-${getEventStart(event)}`;
//                       return (
//                         <ProfessorEventCard
//                           key={eventId}
//                           event={event}
//                           currentUser={user}
//                           onRegister={fetchEvents}
//                         />
//                       );
//                     })}
//                   </div>
//                 )}
//               </>
//             )}

//             {/* My Registrations Tab - View, Pay, Cancel */}
//             {eventsTab === "registered" && (
//               <div>
//                 <MyRegisteredEvents />
//               </div>
//             )}

//             {/* Favorites Tab */}
//             {eventsTab === "favorites" && (
//               <div>
//                 {favorites.length === 0 ? (
//                   <div className="text-center py-12 bg-slate-50 rounded-lg">
//                     <p className="text-slate-600 text-lg mb-2">No favorites yet.</p>
//                     <p className="text-slate-500 text-sm">Click the heart icon on any event card to add it to your favorites.</p>
//                   </div>
//                 ) : (
//                   <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {favorites.map((event) => {
//                       const eventId = event._id || event.id;
//                       return (
//                         <ProfessorEventCard
//                           key={eventId}
//                           event={event}
//                           currentUser={user}
//                           onRegister={fetchEvents}
//                           isFavoritesView={true}
//                         />
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Attended Events Tab - Rate & Comment */}
//             {eventsTab === "attended" && (
//               <div>
//                 <AttendedEvents />
//               </div>
//             )}
//           </div>
//         )}

//         {/* Create Workshop Section */}
//         {activeSection === "createWorkshop" && (
//           <div className="mt-6">
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h2 className="text-2xl font-bold mb-4">Create New Workshop</h2>
//               <p className="text-gray-600">Workshop creation form will be loaded here.</p>
//               <button
//                 onClick={() => navigate("/professor/workshops/new")}
//                 className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
//               >
//                 Go to Workshop Form
//               </button>
//             </div>
//           </div>
//         )}

//         {/* My Workshops Section */}
//         {activeSection === "myWorkshops" && (
//           <div className="mt-6">
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h2 className="text-2xl font-bold mb-4">My Workshops</h2>
//               <p className="text-gray-600">Your workshops list will be displayed here.</p>
//               <button
//                 onClick={() => navigate("/professor/my-workshops")}
//                 className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
//               >
//                 View All Workshops
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Booth Polls Section */}
//         {activeSection === "boothPolls" && (
//           <div className="mt-6">
//             <VendorPolls />
//           </div>
//         )}

//         {/* Gym Schedule Section */}
//         {activeSection === "gymSchedule" && (
//           <div className="mt-6">
//             <GymSchedule />
//           </div>
//         )}

//         {/* Events Reviews Section */}
//         {activeSection === "eventsReviews" && (
//           <div className="mt-6">
//             <h1 className="text-3xl font-bold mb-6">Events Reviews</h1>
//             <EventsReviews />
//           </div>
//         )}

//         {/* Register for Event Section */}
//         {activeSection === "registerEvent" && (
//           <div className="mt-6">
//             <RegisterForEvent />
//           </div>
//         )}

//         {/* Loyalty Vendors Section */}
//         {activeSection === "loyaltyVendors" && (
//           <div className="mt-6">
//             <LoyaltyVendors />
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }

// export default ProfessorDashboard;
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RegisterForEvent from "./RegisterForEvent";
import UpcomingEvents from "../components/UpcomingEvents";
import MyRegisteredEvents from "./MyRegisteredEvents";
import GymSchedule from "./GymSchedule";
import CreateWorkshop from "./CreateWorkshop";
import { fetchMyFavorites } from "../services/favorites";
import EventCard from "../components/EventCard";
import AttendedEvents from "./AttendedEvents";
import EventsReviews from "./EventsReviews";
import DashboardLayout from "../components/DashboardLayout";
import Voting from "../components/Voting";
import LoyaltyVendors from "./LoyaltyVendors";
import ProfessorEventCard from "../components/ProfessorEventCard";
import VendorPolls from "../components/VendorPolls";
import API from "../services/api";
import { getMyWorkshops } from "../services/workshop";
import AvailableBooths from "./AvailableBooths";
import { Store, Home, PenSquare, ClipboardList, Dumbbell, Calendar, CalendarDays, Vote, MessageSquare, ShoppingBag } from "lucide-react";

function ProfessorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Favorites
  const [favorites, setFavorites] = useState([]);
  const [favSet, setFavSet] = useState(new Set());
  const [activeSection, setActiveSection] = useState("overview");
  const [activeQuickAction, setActiveQuickAction] = useState(null);
  const [eventsTab, setEventsTab] = useState("upcoming"); // "upcoming", "registered", "favorites", "attended"
  const [workshops, setWorkshops] = useState([]);
  const [workshopsError, setWorkshopsError] = useState(null);

  // Events state
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Tabs
  const [activeTab] = useState("events");

  const token = localStorage.getItem("token");

  const quickActionClasses =
    "w-full h-16 text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 flex items-center justify-center gap-2 text-white rounded-lg shadow";

  const sidebarItems = [
    { key: "overview", label: "Overview", icon: Home, onClick: () => setActiveSection("overview") },
    { key: "events", label: "Events", icon: CalendarDays, onClick: () => setActiveSection("events") },
    { key: "eventsReviews", label: "Events Reviews", icon: MessageSquare, onClick: () => setActiveSection("eventsReviews") },
    { key: "boothPolls", label: "Booth Polls", icon: Vote, onClick: () => setActiveSection("boothPolls") },
    { key: "availableBooths", label: "Available Booths", icon: ShoppingBag, onClick: () => setActiveSection("availableBooths") },
    { key: "loyaltyVendors", label: "Loyalty Vendors", icon: Store, onClick: () => setActiveSection("loyaltyVendors") },
    { key: "gymSchedule", label: "Gym Schedule", icon: Dumbbell, onClick: () => setActiveSection("gymSchedule") },
  ];

  // Load favorites
  useEffect(() => {
    if (user?.role !== "professor") return;

    (async () => {
      try {
        const favs = await fetchMyFavorites();
        setFavorites(favs);
        setFavSet(new Set(favs.map((e) => e._id || e.id)));
      } catch (e) {
        console.error("Error loading favorites:", e);
      }
    })();
  }, [user?.role, token]);

  // Load events when Events tab is active
  useEffect(() => {
    if (activeSection === "events") {
      fetchEvents();
    }
  }, [activeSection]);

  // Load workshops when myWorkshops quick action is active
  useEffect(() => {
    if (activeQuickAction === "myWorkshops") {
      fetchMyWorkshops();
    }
  }, [activeQuickAction]);

  const fetchMyWorkshops = async () => {
    try {
      const data = await getMyWorkshops();
      setWorkshops(data?.workshops || []);
      setWorkshopsError(null);
    } catch (err) {
      setWorkshopsError(err?.response?.data?.message || err.message);
    }
  };

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

  // Handle Favorites
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

  return (
    <DashboardLayout
      dashboardTitle="Professor Dashboard"
      roleLabel="Professor"
      roleColor="bg-green-500"
      sidebarItems={sidebarItems}
      activeKey={activeSection}
    >
      <div className="p-6">
        {/* Overview Section */}
        {activeSection === "overview" && (
          <section className="mt-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveQuickAction(activeQuickAction === 'createWorkshop' ? null : 'createWorkshop')}
                  className={`${quickActionClasses} ${activeQuickAction === 'createWorkshop' ? 'ring-2 ring-cyan-500' : ''}`}
                >
                  <PenSquare className="w-5 h-5" />
                  Create Workshop
                </button>

                <button
                  type="button"
                  onClick={() => setActiveQuickAction(activeQuickAction === 'myWorkshops' ? null : 'myWorkshops')}
                  className={`${quickActionClasses} ${activeQuickAction === 'myWorkshops' ? 'ring-2 ring-cyan-500' : ''}`}
                >
                  <ClipboardList className="w-5 h-5" />
                  My Workshops
                </button>
              </div>
            </div>

            {/* Quick action content below buttons */}
            {activeQuickAction === 'createWorkshop' && (
              <div className="mt-6">
                <CreateWorkshop />
              </div>
            )}

            {activeQuickAction === 'myWorkshops' && (
              <div className="mt-6 bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6">My Workshops</h2>
                
                {workshopsError && <div className="text-red-600 mb-4">{workshopsError}</div>}

                {workshops.length === 0 ? (
                  <p className="text-gray-600">You haven't created any workshops yet.</p>
                ) : (
                  <div className="space-y-4">
                    {workshops.map((w) => (
                      <div
                        key={w._id}
                        className="bg-gray-50 shadow p-4 rounded-lg border"
                      >
                        <h3 className="text-lg font-bold">{w.title}</h3>

                        <p className="text-sm text-gray-600 mt-1">
                          Status: {w.status} • Registration Deadline:{" "}
                          {new Date(w.registrationDeadline).toLocaleString()}
                        </p>

                        {w.editRequest && w.status !== "approved" && (
                          <p className="text-sm text-orange-600 mt-1">
                            <strong>Requested edits:</strong> {w.editRequest}
                          </p>
                        )}

                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => navigate(`/professor/workshops/${w._id}/edit`)}
                            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => navigate(`/professor/workshops/${w._id}/participants`)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Participants
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Events Section - Complete Event Management */}
        {activeSection === "events" && (
          <div className="mt-6">
            <h1 className="text-3xl font-bold mb-6">Events Management</h1>

            {/* Main Tabs: Upcoming | Registrations | Favorites | Attended */}
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

            {/* Upcoming Events Tab - Search, Filter, Sort, Register, Add to Favorites */}
            {eventsTab === "upcoming" && (
              <>
                {/* Search and Filter Controls */}
                <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search by event or professor name..."
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
                    <option value="workshop">Workshop</option>
                    <option value="trip">Trip</option>
                    <option value="bazaar">Bazaar</option>
                    <option value="conference">Conference</option>
                  </select>

                  <input
                    placeholder="Filter by location"
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
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
                  >
                    Reset
                  </button>
                </div>

                {/* Events Grid */}
                {loadingEvents ? (
                  <p className="text-center text-slate-500 py-8">Loading events...</p>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <p className="text-slate-600 text-lg">No events found matching your criteria.</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => {
                      const eventId = event._id || event.id || `${event.title}-${getEventStart(event)}`;
                      return (
                        <ProfessorEventCard
                          key={eventId}
                          event={event}
                          currentUser={user}
                          userRole="professor"
                          isFavorite={favSet.has(eventId)}
                          onToggleFavorite={handleToggleFavorite}
                          onRegister={fetchEvents}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* My Registrations Tab - View, Pay, Cancel */}
            {eventsTab === "registered" && (
              <div>
                <MyRegisteredEvents />
              </div>
            )}

            {/* Favorites Tab */}
            {eventsTab === "favorites" && (
              <div>
                {favorites.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <p className="text-slate-600 text-lg mb-2">No favorites yet.</p>
                    <p className="text-slate-500 text-sm">Click the heart icon on any event card to add it to your favorites.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((event) => {
                      const eventId = event._id || event.id;
                      return (
                        <ProfessorEventCard
                          key={eventId}
                          event={event}
                          currentUser={user}
                          userRole="professor"
                          isFavorite={favSet.has(eventId)}
                          onToggleFavorite={handleToggleFavorite}
                          onRegister={fetchEvents}
                          isFavoritesView={true}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Attended Events Tab - Rate & Comment */}
            {eventsTab === "attended" && (
              <div>
                <AttendedEvents />
              </div>
            )}
          </div>
        )}

        {/* Create Workshop Section */}
        {activeSection === "createWorkshop" && (
          <div className="mt-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Create New Workshop</h2>
              <p className="text-gray-600">Workshop creation form will be loaded here.</p>
              <button
                onClick={() => navigate("/professor/workshops/new")}
                className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Go to Workshop Form
              </button>
            </div>
          </div>
        )}

        {/* My Workshops Section */}
        {activeSection === "myWorkshops" && (
          <div className="mt-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">My Workshops</h2>
              <p className="text-gray-600">Your workshops list will be displayed here.</p>
              <button
                onClick={() => navigate("/professor/my-workshops")}
                className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                View All Workshops
              </button>
            </div>
          </div>
        )}

        {/* Booth Polls Section */}
        {activeSection === "boothPolls" && (
          <div className="mt-6">
            <VendorPolls />
          </div>
        )}

        {/* Available Booths Section */}
        {activeSection === "availableBooths" && (
          <div className="mt-6">
            <AvailableBooths />
          </div>
        )}

        {/* Gym Schedule Section */}
        {activeSection === "gymSchedule" && (
          <div className="mt-6">
            <GymSchedule />
          </div>
        )}

        {/* Events Reviews Section */}
        {activeSection === "eventsReviews" && (
          <div className="mt-6">
            <h1 className="text-3xl font-bold mb-6">Events Reviews</h1>
            <EventsReviews />
          </div>
        )}

        {/* Register for Event Section */}
        {activeSection === "registerEvent" && (
          <div className="mt-6">
            <RegisterForEvent />
          </div>
        )}

        {/* Loyalty Vendors Section */}
        {activeSection === "loyaltyVendors" && (
          <div className="mt-6">
            <LoyaltyVendors />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProfessorDashboard;

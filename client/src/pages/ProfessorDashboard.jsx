
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RegisterForEvent from "./RegisterForEvent";
import UpcomingEvents from "../components/UpcomingEvents";
import GymSchedule from "./GymSchedule";
import { fetchMyFavorites } from "../services/favorites";
import EventCard from "../components/EventCard";
import AttendedEvents from "./AttendedEvents";
import DashboardLayout from "../components/DashboardLayout";
import Voting from "../components/Voting";
import LoyaltyVendors from "./LoyaltyVendors";
import { Store, Home } from "lucide-react";

function ProfessorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Favorites
  const [favorites, setFavorites] = useState([]);
  const [favSet, setFavSet] = useState(new Set());
  const [activeSection, setActiveSection] = useState("overview");

  // Tabs
  const [activeTab] = useState("events");

  const token = localStorage.getItem("token");

  const sidebarItems = [
    { key: "overview", label: "Overview", icon: Home, onClick: () => setActiveSection("overview") },
    { key: "loyaltyVendors", label: "Loyalty Vendors", icon: Store, onClick: () => setActiveSection("loyaltyVendors") },
    { key: "gymSchedule", label: "Gym Schedule", to: "/professor/gym-schedule" },
    { key: "registerEvent", label: "Register for Event", to: "/professor/register-event" },
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
        <h2 className="text-xl font-semibold mb-6">
          Welcome Professor {user?.name || "User"} 👋
        </h2>

        {/* 🔹 Quick Actions */}
        <section className="mt-6">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row gap-4">
            {/* Create Workshop card */}
            <button
              className="flex-1 min-h-[8rem] bg-blue-100 text-blue-700 text-2xl font-bold rounded-xl flex items-center justify-center shadow hover:bg-blue-200 transition"
              onClick={() => navigate("/professor/workshops/new")}
            >
              Create Workshop
            </button>

            {/* My Workshops card */}
            <button
              className="flex-1 min-h-[8rem] bg-green-100 text-green-700 text-2xl font-bold rounded-xl flex items-center justify-center shadow hover:bg-green-200 transition"
              onClick={() => navigate("/professor/my-workshops")}
            >
              My Workshops
            </button>
          </div>
        </section>

        {activeSection === "loyaltyVendors" ? (
          <div className="mt-10">
            <LoyaltyVendors />
          </div>
        ) : (
          <>
            {/* (Optional) Attended tab – unchanged */}
            {activeTab === "attended" && (
              <div className="mt-6">
                <AttendedEvents />
              </div>
            )}

            <div style={{ marginTop: 40 }}>
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
                            userRole="professor"
                            isFavorite={favSet.has(id)}
                            onToggleFavorite={handleToggleFavorite}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Voting />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProfessorDashboard;

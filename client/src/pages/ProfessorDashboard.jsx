import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreateWorkshop from "./CreateWorkshop";
import { getMyWorkshops } from "../services/workshop";
import RegisterForEvent from "./RegisterForEvent";
import UpcomingEvents from "../components/UpcomingEvents";
import GymSchedule from "./GymSchedule";
import { fetchMyFavorites } from "../services/favorites";
import EventCard from "../components/EventCard";
import AttendedEvents from "./AttendedEvents";
import DashboardLayout from "../components/DashboardLayout";

// ⭐ ADDED FROM FIRST CODE
import Voting from "../components/Voting";

function ProfessorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState(false);
  const [myList, setMyList] = useState([]);
  const [listErr, setListErr] = useState(null);

  // Favorites
  const [favorites, setFavorites] = useState([]);
  const [favSet, setFavSet] = useState(new Set());

  // Tabs
  const [activeTab, setActiveTab] = useState("events");

  const token = localStorage.getItem("token");

  // Load workshops + favorites
  useEffect(() => {
    if (user?.role !== "professor") return;

    (async () => {
      try {
        const data = await getMyWorkshops();
        setMyList(data?.workshops || []);
        setListErr(null);

        const favs = await fetchMyFavorites();
        setFavorites(favs);
        setFavSet(new Set(favs.map((e) => e._id || e.id)));
      } catch (e) {
        setListErr(e?.response?.data?.message || e.message);
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
      sidebarItems={[]}
      activeKey={activeTab}
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Welcome Professor {user?.name || "User"} 👋</h2>

        <div style={{ marginTop: 24 }}>
          <button
            className="btn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowCreate((v) => !v)}
            style={{ marginBottom: 16 }}
          >
            {showCreate ? "Hide Create Workshop" : "Create Workshop"}
          </button>

          {showCreate && (
            <div style={{ marginTop: 12 }}>
              <CreateWorkshop />
            </div>
          )}
        </div>

        {/* Workshops and rest of content (kept unchanged) */}
        <div style={{ marginTop: 24, textAlign: "left" }}>
          <h2 style={{ margin: "12px 0 8px", fontWeight: 600 }}>My Workshops</h2>

          {listErr && <div className="alert alert--error">{listErr}</div>}

          {myList.length === 0 ? (
            <div className="text-gray-600">No workshops yet.</div>
          ) : (
            <div>
              {myList.map((w) => (
                <div
                  key={w._id || w.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{w.title}</div>

                    <div style={{ fontSize: 12, color: "#555" }}>
                      Status: {w.status} • Reg. Deadline: {" "}
                      {new Date(w.registrationDeadline).toLocaleString()}
                    </div>

                    {w.status !== "approved" && w.editRequest && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#b45309",
                          marginTop: 4,
                        }}
                      >
                        <strong>Requested edits:</strong> {w.editRequest}
                      </div>
                    )}
                  </div>

                  <Link
                    className="btn bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                    to={`/professor/workshops/${w._id || w.id}/edit`}
                  >
                    Edit
                  </Link>

                  <Link
                    className="btn bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    to={`/professor/workshops/${w._id || w.id}/participants`}
                  >
                    View Participants
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeTab === "attended" && (
          <div className="mt-6">
            <AttendedEvents />
          </div>
        )}

        <div style={{ marginTop: 40 }}>
          <h2 className="text-2xl font-bold mb-4 text-purple-700">Loyalty Vendors</h2>
          <div className="bg-gray-50 border p-4 rounded-lg shadow-md mb-8">
            <a href="/loyalty-vendors" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">View Loyalty Vendors</a>
          </div>

          <h2 className="text-2xl font-bold mb-4 text-blue-700">Register for Event</h2>
          <div className="bg-gray-50 border p-4 rounded-lg shadow-md mb-8">
            <RegisterForEvent />
          </div>

          <h2 className="text-2xl font-bold mb-4 text-blue-700">Upcoming Events</h2>

          {activeTab === "events" && (
            <div className="mt-6">
              <UpcomingEvents favoritesSet={favSet} onToggleFavorite={handleToggleFavorite} userRole="professor" />
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-center mb-4">My Favorites</h2>
              {favorites.length === 0 ? (
                <p className="text-center text-gray-600">No favorite events yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {favorites.map((ev) => {
                    const id = ev._id || ev.id;
                    return <EventCard key={id} event={ev} userRole="professor" isFavorite={favSet.has(id)} onToggleFavorite={handleToggleFavorite} />;
                  })}
                </div>
              )}
            </div>
          )}

          <h2 className="text-2xl font-bold mb-4 text-blue-700">Gym Schedule</h2>
          <div className="bg-gray-50 border p-4 rounded-lg shadow-md"><GymSchedule /></div>
        </div>

        <Voting />
      </div>
    </DashboardLayout>
  );
}

export default ProfessorDashboard;

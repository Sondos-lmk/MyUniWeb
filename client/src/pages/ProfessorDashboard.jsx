import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreateWorkshop from "./CreateWorkshop";
import { getMyWorkshops } from "../services/workshop";
import MyRegisteredEvents from "./MyRegisteredEvents";
import RegisterForEvent from "./RegisterForEvent";
import UpcomingEvents from "../components/UpcomingEvents";
import GymSchedule from "./GymSchedule";

function ProfessorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [myList, setMyList] = useState([]);
  const [listErr, setListErr] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch my workshops
  useEffect(() => {
    if (user?.role !== "professor") return;

    (async () => {
      try {
        const data = await getMyWorkshops(); // { message, workshops }
        setMyList(data?.workshops || []);
        setListErr(null);
      } catch (e) {
        setListErr(e?.response?.data?.message || e.message);
      }
    })();
  }, [user?.role, token]);

  return (
    <div className="p-10">
      {/* Header + Logout */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Professor Dashboard
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-6">
        Welcome Professor {user?.name || "User"} 👋
      </h2>

      {/* Create Workshop */}
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

      {/* My Workshops */}
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
                    Status: {w.status} • Reg. deadline:{" "}
                    {new Date(w.registrationDeadline).toLocaleString()}
                  </div>
                </div>
                <Link
                  className="btn bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                  to={`/professor/workshops/${w._id || w.id}/edit`}
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Events Section */}
      <div style={{ marginTop: 40 }}>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">
          My Registered Events
        </h2>
        <div className="bg-gray-50 border p-4 rounded-lg shadow-md mb-8">
          <MyRegisteredEvents />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-blue-700">
          Register for Event
        </h2>
        <div className="bg-gray-50 border p-4 rounded-lg shadow-md mb-8">
          <RegisterForEvent />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-blue-700">Upcoming Events</h2>
        <div className="bg-gray-50 border p-4 rounded-lg shadow-md mb-8">
          <UpcomingEvents />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-blue-700">Gym Schedule</h2>
        <div className="bg-gray-50 border p-4 rounded-lg shadow-md">
          <GymSchedule />
        </div>
      </div>
    </div>
  );
}

export default ProfessorDashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ApplyBoothForm from "../components/ApplyBoothForm";
import MyApplications from "../components/MyApplications";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || "unknown";
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reps, setReps] = useState([{ name: "", email: "" }]);
  const [boothSize, setBoothSize] = useState("2x2");

  const name = (() => {
    if (!user) return "Loading...";
    if (role === "vendor") return user.companyName || "Vendor";
    return user.name || "User";
  })();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvents = async () => {
      if (role === "vendor") {
        try {
          const res = await API.get("/events?type=bazaar", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setEvents(res.data);
        } catch (err) {
          console.error("Error fetching vendor events:", err);
        }
      }
    };
    fetchEvents();
  }, [user, role, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setReps([{ name: "", email: "" }]);
    setBoothSize("2x2");
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      const res = await API.post(
        `/events/bazaar/${selectedEvent._id}/register`,
        { reps, boothSize },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || "Applied successfully!");
      setSelectedEvent(null);
      setReps([{ name: "", email: "" }]);
      setBoothSize("2x2");
    } catch (err) {
      console.error("Error applying for bazaar:", err);
      alert(err.response?.data?.error || "Failed to apply");
    }
  };

  return (
    <div className="p-10 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Welcome to your dashboard! {name} ({role})
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* What will appear for Vendors */}
      {role === "vendor" && (
        <div className="flex justify-between items-start gap-6 p-6">
          {/* LEFT SIDE — Upcoming Bazaars */}
          <div className="w-1/2">
            <h2 className="text-xl font-semibold mb-4">Upcoming Bazaar Events</h2>
            {events.length === 0 ? (
              <p>No upcoming bazaars yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="border p-4 rounded-lg shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {new Date(event.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(event.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-gray-700">{event.description}</p>
                    </div>
                    <button
                      onClick={() => handleSelectEvent(event)}
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 self-start"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            )}
            <MyApplications />
          </div>

          {/* RIGHT SIDE — Booth Application Form */}
          <div className="w-1/2">
            <ApplyBoothForm />
          </div>
        </div>
      )}

      {/* Modal for applying to bazaar */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white p-6 rounded-lg w-96 relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Apply for: {selectedEvent.title}</h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2 font-medium">Booth Size</label>
              <select
                className="border rounded p-2 w-full mb-4"
                value={boothSize}
                onChange={(e) => setBoothSize(e.target.value)}
                required
              >
                <option value="2x2">2x2</option>
                <option value="4x4">4x4</option>
              </select>

              {reps.map((rep, idx) => (
                <div key={idx} className="mb-3">
                  <input
                    type="text"
                    placeholder="Name"
                    className="border rounded p-2 w-full mb-1"
                    value={rep.name}
                    onChange={(e) => {
                      const newReps = [...reps];
                      newReps[idx].name = e.target.value;
                      setReps(newReps);
                    }}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="border rounded p-2 w-full"
                    value={rep.email}
                    onChange={(e) => {
                      const newReps = [...reps];
                      newReps[idx].email = e.target.value;
                      setReps(newReps);
                    }}
                    required
                  />
                </div>
              ))}

              {reps.length < 5 && (
                <button
                  type="button"
                  onClick={() => setReps([...reps, { name: '', email: '' }])}
                  className="text-blue-600 underline mb-4"
                >
                  Add another rep
                </button>
              )}

              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

     
    </div>
  );
}

export default Dashboard;

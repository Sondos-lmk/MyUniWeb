import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function GymSchedule() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // ⭐ Added states from first code
  const [registeringId, setRegisteringId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch all gym sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/gym");
        setSessions(res.data || []);
        setError("");
      } catch (err) {
        console.error("Error loading gym sessions:", err);
        setError("Failed to load gym sessions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // ⭐ Added registration logic from first code
  const handleRegister = async (sessionId) => {
    try {
      setRegisteringId(sessionId);
      setMessage("");
      setError("");

      const res = await api.post(`/gym/${sessionId}/register`);

      setMessage(res.data?.message || "Successfully registered for the session 🎉");

      // refresh sessions data after registering
      const updated = await api.get("/gym");
      setSessions(updated.data || []);
    } catch (err) {
      console.error("Error registering:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to register for this session.";
      setError(msg);
      
      // Refresh sessions even on error to update UI
      try {
        const updated = await api.get("/gym");
        setSessions(updated.data || []);
      } catch (refreshErr) {
        console.error("Error refreshing sessions:", refreshErr);
      }
    } finally {
      setRegisteringId(null);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading sessions...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Gym Schedule</h1>

      {/* ⭐ Success + error messages */}
      {message && (
        <p className="mb-4 text-center text-green-700 font-medium">{message}</p>
      )}
      {error && (
        <p className="mb-4 text-center text-red-600 font-medium">{error}</p>
      )}

      {sessions.length === 0 ? (
        <p className="text-center">No gym sessions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Session Title</th>
                <th className="border p-2">Session Type</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Time</th>
                <th className="border p-2">Duration</th>

                {/* ⭐ Combined participants column */}
                <th className="border p-2">Participants</th>

                {/* ⭐ Added Action column */}
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const participantsCount = s.participants?.length || 0;
                const isFull = participantsCount >= s.maxParticipants;

                return (
                  <tr key={s._id} className="text-center">
                    <td className="border p-2 font-semibold">
                      {s.title || "Gym Session"}
                    </td>
                    <td className="border p-2 capitalize">
                      {s.sessionType || "N/A"}
                    </td>
                    <td className="border p-2">
                      {s.date ? new Date(s.date).toDateString() : "N/A"}
                    </td>
                    <td className="border p-2">{s.time}</td>
                    <td className="border p-2">{s.duration} min</td>

                    {/* ⭐ Show current/max participants */}
                    <td className="border p-2">{participantsCount} / {s.maxParticipants}</td>

                    {/* ⭐ Register button */}
                    <td className="border p-2">
                      {(() => {
                        const userId = user?.id || user?._id;
                        const isRegistered = s.participants?.some(
                          (p) => String(p._id || p) === String(userId)
                        );
                        
                        if (isRegistered) {
                          return (
                            <span className="text-sm px-3 py-1 rounded bg-green-100 text-green-700">
                              Registered
                            </span>
                          );
                        }
                        
                        if (isFull) {
                          return (
                            <span className="text-sm px-3 py-1 rounded bg-gray-300 text-gray-700">
                              Full
                            </span>
                          );
                        }
                        
                        return (
                          <button
                            onClick={() => handleRegister(s._id)}
                            disabled={registeringId === s._id}
                            className={`px-3 py-1 rounded text-white text-sm ${
                              registeringId === s._id
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {registeringId === s._id
                              ? "Registering..."
                              : "Register"}
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

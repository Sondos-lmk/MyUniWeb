import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Dumbbell, Clock3 } from "lucide-react";


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
      <h1 className="text-2xl font-bold mb-8 text-center text-slate-700">Gym Schedule</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

  {sessions.map((s) => {
    const participants = s.participants?.length || 0;
    const isFull = participants >= s.maxParticipants;
    const userId = user?.id || user?._id;
    const isRegistered = s.participants?.some(
      (p) => String(p._id || p) === String(userId)
    );

    return (
    <div
      key={s._id}
      className="bg-white rounded-xl shadow-md border p-5 flex flex-col gap-3"
    >
      {/* ICON + PARTICIPANTS */}
      <div className="flex justify-between items-center">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
          <Dumbbell className="w-5 h-5" />
        </div>

        <span className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded-full">
          {participants} / {s.maxParticipants}
        </span>
      </div>

      {/* TITLE */}
      <h3 className="font-bold text-lg text-slate-800">{s.title}</h3>

      {/* DATE */}
      <p className="text-sm text-gray-600 flex items-center gap-2">
        <Clock3 className="w-4 h-4" />
        <span>{new Date(s.date).toLocaleDateString()}</span>
      </p>

      {/* TIME */}
      <p className="text-sm text-gray-600 flex items-center gap-2">
        <Clock3 className="w-4 h-4" />
        <span>{s.time}</span>
      </p>

      {/* DURATION */}
      <p className="text-sm text-gray-600 flex items-center gap-2">
        <Clock3 className="w-4 h-4" />
        <span>{s.duration} minutes</span>
      </p>

      {/* REGISTER BUTTON */}
      <div className="mt-3">
        {isRegistered ? (
          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm block text-center">
            Registered
          </span>
        ) : isFull ? (
          <span className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm block text-center">
            Full
          </span>
        ) : (
          <button
            onClick={() => handleRegister(s._id)}
            disabled={registeringId === s._id}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full transition"
          >
            {registeringId === s._id ? "Registering..." : "Register"}
          </button>
        )}
      </div>
    </div>
    );
  })}

</div>

      )}
    </div>
  );
}

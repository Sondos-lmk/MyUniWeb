// client/src/components/GymScheduleEOPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Dumbbell, Clock3, CalendarDays, MoreVertical } from "lucide-react";
import EditGymSessionModal from "../components/EditGymSessionModal";
import ModernAlert from "../components/ui/ModernAlert";

export default function GymScheduleEOPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const [editingSession, setEditingSession] = useState(null); // full session object
  const [openMenuId, setOpenMenuId] = useState(null); // which card menu is open

  const fetchSessions = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCancelSession = async (sessionId) => {
    setConfirmAction({
      message: "Are you sure you want to cancel this gym session?",
      onConfirm: async () => {
        try {
          setMessage("");
          setError("");
          await api.delete(`/gym/${sessionId}`);
          setMessage("Gym session cancelled successfully.");
          await fetchSessions();
        } catch (err) {
          console.error("Cancel gym session error:", err);
          const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to cancel this gym session.";
          setError(msg);
        }
        setConfirmAction(null);
      }
    });
  };

  const handleEditSaved = () => {
    setEditingSession(null);
    fetchSessions();
  };

  if (loading) {
    return <p className="text-center mt-8">Loading sessions...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-slate-700">
        Gym Schedule (Events Office)
      </h1>

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

            const sessionDate = s.date
              ? new Date(s.date).toLocaleDateString()
              : "—";

            return (
              <div
                key={s._id}
                className="bg-white rounded-xl shadow-md border p-5 flex flex-col gap-3 relative"
              >
                {/* Top Row: Icon + participants + menu */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">
                        {s.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {s.sessionType || "Gym Session"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-gray-100 px-3 py-1 rounded-full">
                      {participants} / {s.maxParticipants}
                      {isFull && (
                        <span className="ml-1 text-[10px] text-red-500">
                          (Full)
                        </span>
                      )}
                    </span>

                    {/* 3 dots menu */}
                    <button
                      onClick={() =>
                        setOpenMenuId((prev) =>
                          prev === s._id ? null : s._id
                        )
                      }
                      className="p-1 rounded-full hover:bg-slate-100"
                    >
                      <MoreVertical className="w-5 h-5 text-slate-600" />
                    </button>

                    {openMenuId === s._id && (
                      <div className="absolute right-4 top-10 bg-white border rounded-xl shadow-lg w-44 z-20 py-1">
                        <button
                          onClick={() => {
                            setEditingSession(s);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left text-sm px-3 py-2 hover:bg-slate-100"
                        >
                          Edit Session
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            handleCancelSession(s._id);
                          }}
                          className="w-full text-left text-sm px-3 py-2 text-red-600 hover:bg-red-50"
                        >
                          Cancel Session
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date, time, duration */}
                <div className="mt-2 space-y-1 text-sm text-slate-700">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-slate-500" />
                    <span>{sessionDate}</span>
                  </p>

                  <p className="flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-slate-500" />
                    <span>{s.time}</span>
                  </p>

                  <p className="text-xs text-slate-500">
                    Duration:{" "}
                    <span className="font-medium">
                      {s.duration} {s.duration ? "minutes" : ""}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingSession && (
        <EditGymSessionModal
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onSaved={handleEditSaved}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ModernAlert
          message={confirmAction.message}
          type="error"
          isConfirm={true}
          onConfirm={confirmAction.onConfirm}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

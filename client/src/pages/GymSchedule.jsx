import React, { useEffect, useState } from "react";
import  api  from "../services/api";

export default function GymSchedule() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/gym");
        setSessions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) return <p className="text-center mt-8">Loading sessions...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Gym Schedule</h1>
      {sessions.length === 0 ? (
        <p className="text-center">No gym sessions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Session Type</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Time</th>
                <th className="border p-2">Duration</th>
                <th className="border p-2">Max Participants</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id} className="text-center">
                  <td className="border p-2 capitalize">{s.sessionType || "N/A"}</td>
                  <td className="border p-2">{new Date(s.date).toDateString()}</td>
                  <td className="border p-2">{s.time}</td>
                  <td className="border p-2">{s.duration} min</td>
                  <td className="border p-2">{s.maxParticipants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

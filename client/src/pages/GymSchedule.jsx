// import React, { useEffect, useState } from "react";
// import  api  from "../services/api";

// export default function GymSchedule() {
//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchSessions = async () => {
//       try {
//         const res = await api.get("/gym");
//         setSessions(res.data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSessions();
//   }, []);

//   if (loading) return <p className="text-center mt-8">Loading sessions...</p>;

//   return (
//     <div className="p-8">
//       <h1 className="text-3xl font-bold mb-6 text-center">Gym Schedule</h1>
//       {sessions.length === 0 ? (
//         <p className="text-center">No gym sessions found.</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border p-2">Date</th>
//                 <th className="border p-2">Time</th>
//                 <th className="border p-2">Duration</th>
//                 <th className="border p-2">Max Participants</th>
//               </tr>
//             </thead>
//             <tbody>
//               {sessions.map((s) => (
//                 <tr key={s._id} className="text-center">
//                   <td className="border p-2">{new Date(s.date).toDateString()}</td>
//                   <td className="border p-2">{s.time}</td>
//                   <td className="border p-2">{s.duration} min</td>
//                   <td className="border p-2">{s.maxParticipants}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { getGymSchedule, registerForGymSession } from "../services/api";

export default function GymSchedule() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await getGymSchedule();
      setSessions(res.data || []);
      setError("");
    } catch (err) {
      console.error("Error loading gym sessions:", err);
      setError(
        err.response?.data?.message || "Failed to load gym sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRegister = async (sessionId) => {
    try {
      const res = await registerForGymSession(sessionId);
      alert(res.data.message || "Registered successfully.");
      // refresh sessions so participants / spots update
      await fetchSessions();
    } catch (err) {
      console.error("Error registering for gym session:", err);
      alert(
        err.response?.data?.message ||
          "Could not register for this gym session."
      );
    }
  };

  if (loading) return <p className="text-center mt-8">Loading sessions...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;

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
                <th className="border p-2">Date</th>
                <th className="border p-2">Time</th>
                <th className="border p-2">Duration</th>
                <th className="border p-2">Max Participants</th>
                <th className="border p-2">Spots Left</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const participantsCount = s.participants?.length || 0;
                const spotsLeft = s.maxParticipants - participantsCount;
                const isFull = spotsLeft <= 0;

                return (
                  <tr key={s._id} className="text-center">
                    <td className="border p-2">
                      {new Date(s.date).toDateString()}
                    </td>
                    <td className="border p-2">{s.time}</td>
                    <td className="border p-2">{s.duration} min</td>
                    <td className="border p-2">{s.maxParticipants}</td>
                    <td className="border p-2">
                      {spotsLeft < 0 ? 0 : spotsLeft}
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleRegister(s._id)}
                        disabled={isFull}
                        className={`px-4 py-1 rounded ${
                          isFull
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isFull ? "Full" : "Register"}
                      </button>
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

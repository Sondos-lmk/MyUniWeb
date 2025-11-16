import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getWorkshopParticipants } from "../services/workshop";

export default function ProfessorWorkshopParticipants() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getWorkshopParticipants(id);
        setData(res);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return (
      <div className="p-6 text-xl font-semibold text-gray-700">
        Loading participants…
      </div>
    );

  if (err)
    return (
      <div className="p-6 text-red-600 text-lg">
        Error: {err}
      </div>
    );

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">
        Participants for: {data.title}
      </h1>

      <p className="mb-4 text-gray-700">
        <strong>Capacity:</strong> {data.capacity} <br />
        <strong>Registered:</strong> {data.registeredCount} <br />
        <strong>Remaining Spots:</strong> {data.remainingSpots}
      </p>

      {data.participants.length === 0 ? (
        <div className="p-4 bg-gray-100 text-gray-600 rounded">
          No participants registered yet.
        </div>
      ) : (
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {data.participants.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">{p.email}</td>
                <td className="px-4 py-2 capitalize">{p.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

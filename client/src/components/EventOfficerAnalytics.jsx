import { useEffect, useState } from "react";
import API from "../services/api";

export default function EventOfficerAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Analytics component mounted");

    const fetchAnalytics = async () => {
      try {
        const res = await API.get("/eventOfficer/analytics");
        console.log("Analytics response:", res.data);
        setData(res.data);
      } catch (err) {
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <p className="text-gray-600">Loading analytics…</p>;
  if (!data) return <p className="text-red-600">Unable to load analytics.</p>;

  return (
    <div className="bg-white p-6 mt-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Event Statistics</h2>

      {/* === Monthly Events === */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-cyan-700">Events per Month</h3>
        {data.monthlyEvents.length === 0 ? (
          <p className="text-gray-500">No events yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.monthlyEvents.map((item, idx) => (
              <div key={idx} className="p-4 bg-cyan-50 rounded-lg shadow">
                <p className="text-gray-600">{item.month}</p>
                <p className="text-2xl font-bold text-cyan-700">{item.count}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === Event Types === */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-cyan-700">Events by Type</h3>
        {Object.keys(data.eventTypeCounts).length === 0 ? (
          <p className="text-gray-500">No event types found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(data.eventTypeCounts).map(([type, count]) => (
              <div key={type} className="p-4 bg-blue-50 rounded-lg shadow">
                <p className="text-gray-600 capitalize">{type}</p>
                <p className="text-2xl font-bold text-blue-700">{count}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === Registrations by Month === */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-cyan-700">Registrations per Month</h3>
        {data.registrationsByMonth.length === 0 ? (
          <p className="text-gray-500">No registrations so far.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.registrationsByMonth.map((item, idx) => (
              <div key={idx} className="p-4 bg-indigo-50 rounded-lg shadow">
                <p className="text-gray-600">{item.month}</p>
                <p className="text-2xl font-bold text-indigo-700">{item.count}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

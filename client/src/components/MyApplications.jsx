import { useEffect, useState } from "react";
import API from "../services/api";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await API.get("events/my-applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data.applications);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

  if (loading) return <p>Loading your applications...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (applications.length === 0)
    return <p>You haven't applied for any bazaars or booths yet.</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl mt-6">
      <h2 className="text-xl font-bold mb-4">My Applications</h2>
      <div className="flex flex-col gap-4">
        {applications.map((app, idx) => (
          <div
            key={idx}
            className="border p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-lg">
             {app.title}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                {new Date(app.startDate).toLocaleDateString()} -{" "}
                {new Date(app.endDate).toLocaleDateString()}
              </p>
              <p className="text-gray-700">
                Location: {app.location || "N/A"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                app.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : app.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {app.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyApplications;

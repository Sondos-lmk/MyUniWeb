import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function ApproveWorkshops() {
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Fetch pending workshops (only Event Officer can)
  useEffect(() => {
    const fetchPendingWorkshops = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get("/events/pending/workshops");
        console.log("Fetched workshops:", res.data);

        const all = res.data.workshops || res.data;
        const pending = all.filter((w) => w.status === "pending");
        setWorkshops(pending);
      } catch (err) {
        console.error("Error fetching workshops:", err);
        setError("Failed to load workshops.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingWorkshops();
  }, []);

  // ✅ Approve workshop
  const handleApprove = async (id) => {
    try {
      await API.patch(`/events/${id}/approve`);
      setWorkshops((prev) => prev.filter((w) => w._id !== id));
      setMessage("Workshop approved and published successfully.");
      setError("");
    } catch (err) {
      console.error("Error approving workshop:", err);
      setError(err.response?.data?.message || "Failed to approve this workshop.");
    }
  };

  // ✅ Reject workshop
  const handleReject = async (id) => {
    try {
      await API.patch(`/events/${id}/reject`);
      setWorkshops((prev) => prev.filter((w) => w._id !== id));
      setMessage("Workshop rejected successfully.");
      setError("");
    } catch (err) {
      console.error("Error rejecting workshop:", err);
      setError(err.response?.data?.message || "Failed to reject this workshop.");
    }
  };

  const handleRequestEdit = (id) => {
    navigate(`/workshops/${id}/request-edit`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Approve or Reject Workshops
      </h1>

      {message && <p className="text-green-600 mb-3 text-center">{message}</p>}
      {error && <p className="text-red-600 mb-3 text-center">{error}</p>}

      {loading ? (
        <p className="text-center">Loading workshops...</p>
      ) : workshops.length === 0 ? (
        <p className="text-center">No pending workshops for approval.</p>
      ) : (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Location</th>
                <th className="p-2 border">Start</th>
                <th className="p-2 border">End</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workshops.map((w) => (
                <tr key={w._id} className="text-center hover:bg-gray-50">
                  <td className="p-2 border font-semibold">{w.title}</td>
                  <td className="p-2 border">{w.location || "-"}</td>
                  <td className="p-2 border">
                    {w.startDate
                      ? new Date(w.startDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2 border">
                    {w.endDate
                      ? new Date(w.endDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2 border text-left max-w-xs truncate">
                    {w.description || "—"}
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleApprove(w._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                    >
                      Accept&Publish
                    </button>
                    <button
                      onClick={() => handleRequestEdit(w._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700"
                    >
                      Request to Edit
                    </button>
                    <button
                      onClick={() => handleReject(w._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

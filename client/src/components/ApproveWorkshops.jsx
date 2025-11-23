import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Approve or Reject Workshops
      </h1>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-center">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-600">Loading workshops...</p>
      ) : workshops.length === 0 ? (
        <p className="text-center text-gray-600">No pending workshops for approval.</p>
      ) : (
        <div className="space-y-4">
          {workshops.map((w) => (
            <div
              key={w._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left side: Title and Description */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {w.title}
                  </h2>
                  {/* Hover Details Button */}
                  <div className="relative inline-block group mt-3">
                    <button
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-default border border-gray-300"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Info className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    
                    {/* Tooltip with all details */}
                    <div className="absolute left-0 top-full mt-2 w-80 bg-gray-900 text-white text-sm rounded-lg shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="space-y-2">
                                                <div>
                                                  <span className="font-semibold">Description:</span>{" "}
                                                  {w.desc || "No description provided"}
                                                </div>
                        <div>
                          <span className="font-semibold">Location:</span>{" "}
                          {w.location || "-"}
                        </div>
                        <div>
                          <span className="font-semibold">Start Date:</span>{" "}
                          {w.startDate
                            ? new Date(w.startDate).toLocaleString()
                            : "-"}
                        </div>
                        <div>
                          <span className="font-semibold">End Date:</span>{" "}
                          {w.endDate
                            ? new Date(w.endDate).toLocaleString()
                            : "-"}
                        </div>
                        <div>
                          <span className="font-semibold">Capacity:</span>{" "}
                          {w.capacity || "Not specified"}
                        </div>
                        <div>
                          <span className="font-semibold">Required Budget:</span>{" "}
                          {w.requiredBudget ? `$${w.requiredBudget}` : "Not specified"}
                        </div>
                        <div>
                          <span className="font-semibold">Fundraising Source:</span>{" "}
                          {w.fundraisingSource || "-"}
                        </div>
                        <div>
                          <span className="font-semibold">Responsible Faculty:</span>{" "}
                          {w.responsibleFaculty || "-"}
                        </div>
                        {((w.professorNames && w.professorNames.length > 0) || 
                          (w.professorsParticipating && w.professorsParticipating.length > 0)) && (
                          <div>
                            <span className="font-semibold">Professors Participating:</span>{" "}
                            {w.professorNames && w.professorNames.length > 0
                              ? w.professorNames.join(", ")
                              : w.professorsParticipating && w.professorsParticipating.length > 0
                              ? w.professorsParticipating.map(p => p.name || p.email).join(", ")
                              : "-"}
                          </div>
                        )}
                        {w.fullAgenda && (
                          <div>
                            <span className="font-semibold">Full Agenda:</span>{" "}
                            <div className="mt-1 text-gray-300">{w.fullAgenda}</div>
                          </div>
                        )}
                        {w.extraRequiredResource && (
                          <div>
                            <span className="font-semibold">Extra Resources:</span>{" "}
                            {w.extraRequiredResource}
                          </div>
                        )}
                        {w.createdBy && (
                          <div>
                            <span className="font-semibold">Created By:</span>{" "}
                            {w.createdBy.name || w.createdBy.email || "Unknown"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Action buttons */}
                <div className="flex flex-col gap-2 md:min-w-[200px]">
                  <button
                    onClick={() => handleApprove(w._id)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium"
                  >
                    Accept & Publish
                  </button>
                  <button
                    onClick={() => handleRequestEdit(w._id)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
                  >
                    Request to Edit
                  </button>
                  <button
                    onClick={() => handleReject(w._id)}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

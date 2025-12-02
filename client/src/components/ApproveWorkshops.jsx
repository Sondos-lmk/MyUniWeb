import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, DollarSign, GraduationCap } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        Approve or Reject Workshops
      </h1>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-slate-600">Loading workshops...</p>
      ) : workshops.length === 0 ? (
        <p className="text-center text-slate-600">No pending workshops for approval.</p>
      ) : (
        <div className="space-y-6">
          {workshops.map((w) => (
            <div
              key={w._id}
              className="bg-white rounded-xl shadow-md border border-slate-200 p-6"
            >
              {/* Title */}
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                {w.title}
              </h2>

              {/* Description */}
              {w.desc && (
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {w.desc}
                </p>
              )}

              {/* Workshop Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Location */}
                {w.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Location</div>
                      <div className="text-sm font-semibold text-slate-900">{w.location}</div>
                    </div>
                  </div>
                )}

                {/* Start Date */}
                {w.startDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Start Date</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {new Date(w.startDate).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* End Date */}
                {w.endDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">End Date</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {new Date(w.endDate).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Capacity */}
                {w.capacity && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Capacity</div>
                      <div className="text-sm font-semibold text-slate-900">{w.capacity}</div>
                    </div>
                  </div>
                )}

                {/* Budget */}
                {w.requiredBudget && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Required Budget</div>
                      <div className="text-sm font-semibold text-slate-900">${w.requiredBudget}</div>
                    </div>
                  </div>
                )}

                {/* Fundraising Source */}
                {w.fundraisingSource && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Fundraising Source</div>
                      <div className="text-sm font-semibold text-slate-900">{w.fundraisingSource}</div>
                    </div>
                  </div>
                )}

                {/* Responsible Faculty */}
                {w.responsibleFaculty && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Responsible Faculty</div>
                      <div className="text-sm font-semibold text-slate-900">{w.responsibleFaculty}</div>
                    </div>
                  </div>
                )}

                {/* Professors */}
                {((w.professorNames && w.professorNames.length > 0) || 
                  (w.professorsParticipating && w.professorsParticipating.length > 0)) && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <GraduationCap className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Professors Participating</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {w.professorNames && w.professorNames.length > 0
                          ? w.professorNames.join(", ")
                          : w.professorsParticipating && w.professorsParticipating.length > 0
                          ? w.professorsParticipating.map(p => p.name || p.email).join(", ")
                          : "-"}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              {(w.fullAgenda || w.extraRequiredResource) && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-3">
                  {w.fullAgenda && (
                    <div>
                      <div className="text-xs text-slate-500 font-medium mb-1">Full Agenda</div>
                      <p className="text-sm text-slate-700">{w.fullAgenda}</p>
                    </div>
                  )}
                  {w.extraRequiredResource && (
                    <div>
                      <div className="text-xs text-slate-500 font-medium mb-1">Extra Resources</div>
                      <p className="text-sm text-slate-700">{w.extraRequiredResource}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Created By */}
              {w.createdBy && (
                <p className="text-sm text-slate-500 mb-4">
                  Created by: <span className="font-medium text-slate-700">{w.createdBy.name || w.createdBy.email || "Unknown"}</span>
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleApprove(w._id)}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Accept & Publish
                </button>
                <button
                  onClick={() => handleRequestEdit(w._id)}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Request to Edit
                </button>
                <button
                  onClick={() => handleReject(w._id)}
                  className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

export default function RequestEditModal({ open, onClose, workshopId }) {
  const token = localStorage.getItem("token");

  const [workshop, setWorkshop] = useState(null);
  const [editRequest, setEditRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingWorkshop, setLoadingWorkshop] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  // Fetch workshop details
  useEffect(() => {
    if (!open || !workshopId) return;

    const fetchWorkshop = async () => {
      try {
        setLoadingWorkshop(true);
        const res = await axios.get(
          `http://localhost:4000/api/events/${workshopId}`
        );
        setWorkshop(res.data);
      } catch (err) {
        console.error("Error loading workshop:", err);
        setError("Failed to load workshop details.");
      } finally {
        setLoadingWorkshop(false);
      }
    };

    fetchWorkshop();
  }, [open, workshopId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setError("");

    try {
      const res = await axios.patch(
        `http://localhost:4000/api/events/workshop/${workshopId}/request-edit`,
        { editRequest },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg(res.data.message || "Edit request submitted successfully!");
      setEditRequest("");
    } catch (err) {
      console.error("Error submitting edit request:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit edit request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6">

        {/* Close button */}
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-5">Request Workshop Edit</h2>

        {/* Loading workshop info */}
        {loadingWorkshop ? (
          <p className="text-gray-600 py-10 text-center">Loading workshop...</p>
        ) : error ? (
          <p className="text-red-600 font-semibold py-6 text-center">{error}</p>
        ) : (
          <>
            {/* Workshop details */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 space-y-2">
              <p>
                <strong>Title:</strong> {workshop.title}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {workshop.desc || "No description"}
              </p>
              <p>
                <strong>Professors:</strong>{" "}
                {(() => {
                  const names = Array.isArray(workshop.professorNames)
                    ? workshop.professorNames.filter(Boolean)
                    : [];

                  if (names.length) return names.join(", ");

                  const participants = Array.isArray(
                    workshop.professorsParticipating
                  )
                    ? workshop.professorsParticipating
                    : [];

                  const participantNames = participants
                    .map((p) => p?.name)
                    .filter(Boolean);

                  if (participantNames.length)
                    return participantNames.join(", ");

                  return workshop?.createdBy?.name || "Unassigned";
                })()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="capitalize">{workshop.status}</span>
              </p>
            </div>

            {/* Edit Request Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 border border-gray-200 p-6 rounded-xl shadow-sm"
            >
              <label className="block text-lg font-semibold">
                Edit Request Message
              </label>

              <textarea
                value={editRequest}
                onChange={(e) => setEditRequest(e.target.value)}
                placeholder="Describe the changes you’d like to request for this workshop..."
                className="border border-gray-300 p-3 rounded-md w-full h-32 resize-none focus:ring focus:ring-blue-100"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md mt-1 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>

            {successMsg && (
              <div className="bg-green-100 text-green-700 p-3 rounded-md mt-4">
                ✅ {successMsg}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

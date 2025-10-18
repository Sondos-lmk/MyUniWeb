import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function RequestEditForm() {
  const { id } = useParams(); // workshop id from URL
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [workshop, setWorkshop] = useState(null);
  const [editRequest, setEditRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  // ✅ Load workshop details
  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/events/${id}`);
        setWorkshop(res.data);
      } catch (err) {
        console.error("Error loading workshop:", err);
        setError("Failed to load workshop details.");
      }
    };
    fetchWorkshop();
  }, [id]);

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setError("");

    try {
      const res = await axios.patch(
        `http://localhost:4000/api/events/workshop/${id}/request-edit`,
        { editRequest },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg(res.data.message || "Edit request saved successfully.");
      setEditRequest("");
    } catch (err) {
      console.error("Error sending edit request:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit edit request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (error)
    return (
      <div className="p-10 text-center text-red-600 font-semibold">{error}</div>
    );

  if (!workshop)
    return (
      <div className="p-10 text-center text-gray-600">Loading workshop...</div>
    );

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Request Workshop Edit</h1>

      {/* Workshop details */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <p>
          <strong>Title:</strong> {workshop.title}
        </p>
        <p>
          <strong>Description:</strong> {workshop.desc || "No description"}
        </p>
        <p>
          <strong>Professor:</strong>{" "}
          {workshop.professor?.name || "Not assigned"}
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md mt-2 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {/* Feedback messages */}
      {successMsg && (
        <div className="bg-green-100 text-green-700 p-3 rounded-md mt-4">
          ✅ {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mt-4">
          ❌ {error}
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 text-sm text-blue-600 hover:underline"
      >
        ← Back
      </button>
    </div>
  );
}

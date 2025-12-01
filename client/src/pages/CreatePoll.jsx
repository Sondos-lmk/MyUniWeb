// pages/CreatePoll.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import ModernAlert from "../components/ui/ModernAlert";

export default function CreatePoll() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    boothId,
    boothTitle,
    vendors = [],
    reason,
    conflictStart,
    conflictEnd,
  } = location.state || {};

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  useEffect(() => {
    if (!boothId || vendors.length < 2) return;

    const v1 = vendors[0]?.name || "Vendor 1";
    const v2 = vendors[1]?.name || "Vendor 2";

    setTitle(`Booth conflict: ${boothTitle || ""}`.trim());
    setQuestion(`Who should get the booth: ${v1} or ${v2}?`);
  }, [boothId, vendors, boothTitle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!startAt || !endAt) {
      setError("Please choose both start and end date/time for the poll.");
      return;
    }

    if (!boothId || vendors.length < 2) {
      setError("Missing booth or vendors data for this poll.");
      return;
    }

    try {
      setSubmitting(true);

      await API.post("/polls", {
        boothId,
        title,
        question,
        reason,
        startAt,
        endAt,
        vendors: vendors.map((v) => ({
          vendorId: v.vendorId,
          name: v.name,
        })),
      });

      showAlert("Poll created and published successfully.", "success");
      navigate(-1); // go back to conflicts page
    } catch (err) {
      console.error("Error creating poll:", err);
      setError(
        err.response?.data?.message || "Failed to create poll. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!boothId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Create Poll</h2>
        <p className="text-red-600">
          Missing booth conflict data. Please navigate from the conflicts page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Create Poll for Booth Conflict</h2>

      <div className="mb-4 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Booth:</span>{" "}
          {boothTitle || "Unknown booth"}
        </p>
        <p>
          <span className="font-semibold">Vendors:</span>{" "}
          {vendors.map((v) => v.name).join(" vs ")}
        </p>
        {conflictStart && conflictEnd && (
          <p>
            <span className="font-semibold">Conflict dates:</span>{" "}
            {new Date(conflictStart).toLocaleDateString()} →{" "}
            {new Date(conflictEnd).toLocaleDateString()}
          </p>
        )}
        {reason && (
          <p>
            <span className="font-semibold">Reason:</span> {reason}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Poll title</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Question</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Poll start
            </label>
            <input
              type="datetime-local"
              className="w-full border rounded px-3 py-2 text-sm"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Poll end</label>
            <input
              type="datetime-local"
              className="w-full border rounded px-3 py-2 text-sm"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Poll"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>

      {alertMessage && (
        <ModernAlert
          message={alertMessage}
          type={alertType}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
}

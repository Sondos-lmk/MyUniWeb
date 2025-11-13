// client/src/pages/GenerateVisitorQR.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import API from "../services/api";

export default function GenerateVisitorQR() {
  const { id } = useParams(); // event id from URL
  const navigate = useNavigate();

  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorNationalId, setVisitorNationalId] = useState("");
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setQrUrl(null);

    if (!visitorName || !visitorNationalId) {
      setErrorMsg("Name and National ID are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post(
        `/events/${id}/generate-visitor-qr`,
        {
          name: visitorName,
          email: visitorEmail,
          nationalId: visitorNationalId,
        },
        { responseType: "blob" } // backend returns PNG file
      );

      const blob = new Blob([res.data], { type: "image/png" });
      const objectUrl = URL.createObjectURL(blob);
      setQrUrl(objectUrl);
    } catch (err) {
      console.error("QR generation error:", err);
      setErrorMsg(
        err.response?.data?.message || "Failed to generate QR code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    saveAs(qrUrl, `visitor_qr_${visitorName || "visitor"}.png`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-700 mb-3"
        >
          ← Back
        </button>

        <h1 className="text-xl font-bold mb-4">
          Generate Visitor QR
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          Event ID: <span className="font-mono text-xs">{id}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Visitor Name *
            </label>
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Ahmed Ali"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Visitor Email
            </label>
            <input
              type="email"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. ahmed@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              National ID *
            </label>
            <input
              type="text"
              value={visitorNationalId}
              onChange={(e) => setVisitorNationalId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 29912301234567"
            />
          </div>

          {errorMsg && (
            <div className="text-red-600 text-xs mt-1">{errorMsg}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-4 py-2 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate QR"}
          </button>
        </form>

        {qrUrl && (
          <div className="border-t pt-4 mt-2 text-center">
            <h2 className="text-sm font-semibold mb-3">QR Preview</h2>
            <img
              src={qrUrl}
              alt="Visitor QR"
              className="w-40 h-40 mx-auto mb-3 border rounded-lg"
            />
            <button
              onClick={handleDownload}
              className="rounded-xl px-4 py-2 bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
            >
              Download QR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

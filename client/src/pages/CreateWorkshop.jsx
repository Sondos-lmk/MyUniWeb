import { useState } from "react";
import API from "../services/api"; // axios instance (baseURL http://localhost:4000/api)

function isAfter(a, b) {
  return new Date(a).getTime() > new Date(b).getTime();
}

export default function CreateWorkshop() {
  const [form, setForm] = useState({
    title: "",
    location: "GUC Cairo",
    startAt: "",
    endAt: "",
    shortDescription: "",
    agenda: "",
    responsibleFaculty: "MET",
    professors: "", // comma-separated
    requiredBudget: 0,
    fundraisingSource: "GUC",
    extraResources: "",
    capacity: 10,
    registrationDeadline: "",
  });
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setOk(null);

    // basic validations
    if (!form.title || form.title.trim().length < 4) return setError("Title must be at least 4 characters.");
    if (!form.startAt || !form.endAt) return setError("Start and end date/time are required.");
    if (!isAfter(form.endAt, form.startAt)) return setError("End time must be after start time.");
    if (!form.registrationDeadline) return setError("Registration deadline is required.");
    if (isAfter(form.registrationDeadline, form.startAt)) return setError("Registration deadline must be before the start.");
    if (!form.shortDescription) return setError("Short description is required.");
    if (!form.agenda) return setError("Full agenda is required.");
    if (!form.capacity || Number(form.capacity) < 1) return setError("Capacity must be at least 1.");

  const payload = {
        type: "workshop", // ✅ required by backend

        title: form.title.trim(),
        location: form.location,
        startDate: new Date(form.startAt).toISOString(),
        endDate: new Date(form.endAt).toISOString(),
        registrationDeadline: new Date(form.registrationDeadline).toISOString(),
        requiredBudget: Number(form.requiredBudget) || 0,
        fundraisingSource: form.fundraisingSource,
        desc: form.shortDescription.trim(),
        fullAgenda: form.agenda.trim(),
        responsibleFaculty: form.responsibleFaculty,
        extraRequiredResource: (form.extraResources || "").trim(),
        capacity: Number(form.capacity),
        // Send free-text professor names as an array
        professorNames: (form.professors || "")
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
    };




    try {
      setLoading(true);
      const { data } = await API.post("/events/professor/workshop", payload); // protected by requireAuth
      setOk(`Workshop created ✔ (id: ${data?._id || data?.id || "new"})`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to create workshop.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-slate-800">New Workshop</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      {ok && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{ok}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Intro to Data Engineering"
          />
        </div>

        {/* Location and Responsible Faculty - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Location (Campus)</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            >
              <option>GUC Cairo</option>
              <option>GUC Berlin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Responsible Faculty</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.responsibleFaculty}
              onChange={(e) => update("responsibleFaculty", e.target.value)}
            >
              {[
                "MET",
                "IET",
                "EMS",
                "Pharma",
                "Business Informatics",
                "Management",
                "Applied Arts",
                "Architecture",
                "",
              ].map((f) => (
                <option key={f} value={f}>
                  {f || "(Unspecified)"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start and End - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Start</label>
            <input
              type="datetime-local"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.startAt}
              onChange={(e) => update("startAt", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">End</label>
            <input
              type="datetime-local"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.endAt}
              onChange={(e) => update("endAt", e.target.value)}
            />
          </div>
        </div>

        {/* Capacity and Registration Deadline - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Capacity</label>
            <input
              type="number"
              min={1}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.capacity}
              onChange={(e) => update("capacity", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Registration Deadline</label>
            <input
              type="datetime-local"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.registrationDeadline}
              onChange={(e) => update("registrationDeadline", e.target.value)}
            />
          </div>
        </div>

        {/* Required Budget and Funding Source - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Required Budget</label>
            <input
              type="number"
              min={0}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.requiredBudget}
              onChange={(e) => update("requiredBudget", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Funding Source</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.fundraisingSource}
              onChange={(e) => update("fundraisingSource", e.target.value)}
            >
              <option>GUC</option>
              <option>External</option>
            </select>
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Short Description</label>
          <textarea
            rows={3}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={form.shortDescription}
            onChange={(e) => update("shortDescription", e.target.value)}
            placeholder="One-paragraph overview of the workshop"
          />
        </div>

        {/* Full Agenda */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Agenda</label>
          <textarea
            rows={6}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={form.agenda}
            onChange={(e) => update("agenda", e.target.value)}
            placeholder="Agenda, topics, timings, speakers..."
          />
        </div>

        {/* Professors Participating */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Professor(s) Participating</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="e.g. Dr. Omar, Dr. Sameh"
            value={form.professors}
            onChange={(e) => update("professors", e.target.value)}
          />
          <small className="text-slate-500 text-xs">Separate names with commas.</small>
        </div>

        {/* Extra Resources */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Extra Required Resources (optional)</label>
          <textarea
            rows={3}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={form.extraResources}
            onChange={(e) => update("extraResources", e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-center">
          <button 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Workshop"}
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}

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
    <div className="form-container">
      <h1 className="form-title">New Workshop</h1>

      {error && <div className="alert alert--error">{error}</div>}
      {ok && <div className="alert alert--ok">{ok}</div>}

      <form onSubmit={onSubmit} className="form-grid">
        {/* Title (full width) */}
        <div className="full">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Intro to Data Engineering"
          />
        </div>

        {/* Location */}
        <div>
          <label className="form-label">Location (Campus)</label>
          <select
            className="form-select"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          >
            <option>GUC Cairo</option>
            <option>GUC Berlin</option>
          </select>
        </div>

        {/* Responsible Faculty */}
        <div>
          <label className="form-label">Responsible Faculty</label>
          <select
            className="form-select"
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

        {/* Start / End */}
        <div>
          <label className="form-label">Start</label>
          <input
            type="datetime-local"
            className="form-input"
            value={form.startAt}
            onChange={(e) => update("startAt", e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">End</label>
          <input
            type="datetime-local"
            className="form-input"
            value={form.endAt}
            onChange={(e) => update("endAt", e.target.value)}
          />
        </div>

        {/* Capacity / Registration Deadline */}
        <div>
          <label className="form-label">Capacity</label>
          <input
            type="number"
            min={1}
            className="form-input"
            value={form.capacity}
            onChange={(e) => update("capacity", e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Registration Deadline</label>
          <input
            type="datetime-local"
            className="form-input"
            value={form.registrationDeadline}
            onChange={(e) => update("registrationDeadline", e.target.value)}
          />
        </div>

        {/* Required Budget / Funding Source */}
        <div>
          <label className="form-label">Required Budget</label>
          <input
            type="number"
            min={0}
            className="form-input"
            value={form.requiredBudget}
            onChange={(e) => update("requiredBudget", e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Funding Source</label>
          <select
            className="form-select"
            value={form.fundraisingSource}
            onChange={(e) => update("fundraisingSource", e.target.value)}
          >
            <option>GUC</option>
            <option>External</option>
          </select>
        </div>

        {/* Short Description (full) */}
        <div className="full">
          <label className="form-label">Short Description</label>
          <textarea
            rows={3}
            className="form-textarea"
            value={form.shortDescription}
            onChange={(e) => update("shortDescription", e.target.value)}
            placeholder="One-paragraph overview of the workshop"
          />
        </div>

        {/* Full Agenda (full) */}
        <div className="full">
          <label className="form-label">Full Agenda</label>
          <textarea
            rows={6}
            className="form-textarea"
            value={form.agenda}
            onChange={(e) => update("agenda", e.target.value)}
            placeholder="Agenda, topics, timings, speakers..."
          />
        </div>

        {/* Professors (full) */}
        <div className="full">
          <label className="form-label">Professor(s) Participating</label>
          <input
            className="form-input"
            placeholder="e.g. Dr. Omar, Dr. Sameh"
            value={form.professors}
            onChange={(e) => update("professors", e.target.value)}
          />
          <small>Separate names with commas.</small>
        </div>

        {/* Extra Resources (full) */}
        <div className="full">
          <label className="form-label">Extra Required Resources (optional)</label>
          <textarea
            rows={3}
            className="form-textarea"
            value={form.extraResources}
            onChange={(e) => update("extraResources", e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="btn-row full">
          <button className="btn" disabled={loading}>
            {loading ? "Creating..." : "Create Workshop"}
          </button>
        </div>
      </form>
    </div>
  );
}

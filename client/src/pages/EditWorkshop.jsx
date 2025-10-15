import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMyWorkshops, updateWorkshop } from "../services/workshop";

/** Convert ISO string to value acceptable by <input type="datetime-local"> */
function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/** Simple time compare (strings from datetime-local) */
function isAfter(a, b) {
  return new Date(a).getTime() > new Date(b).getTime();
}

export default function EditWorkshop() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);

  const [form, setForm] = useState({
    title: "",
    location: "GUC Cairo",
    startAt: "",
    endAt: "",
    registrationDeadline: "",
    requiredBudget: 0,
    fundraisingSource: "GUC",
    desc: "",
    fullAgenda: "",
    responsibleFaculty: "MET",
    extraRequiredResource: "",
    capacity: 10,
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Load workshop from "my workshops" then pick by id
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyWorkshops(); // { message, workshops: [...] }
        const list = Array.isArray(data?.workshops) ? data.workshops : [];
        const found = list.find((w) => (w._id || w.id) === id);
        if (!found) {
          setError("Workshop not found or not owned by you.");
          return;
        }
        // Prefill
        setForm({
          title: found.title || "",
          location: found.location || "GUC Cairo",
          startAt: toLocalInputValue(found.startDate || found.startAt),
          endAt: toLocalInputValue(found.endDate || found.endAt),
          registrationDeadline: toLocalInputValue(found.registrationDeadline),
          requiredBudget: Number(found.requiredBudget ?? 0),
          fundraisingSource: found.fundraisingSource || "GUC",
          desc: found.desc || "",
          fullAgenda: found.fullAgenda || "",
          responsibleFaculty: found.responsibleFaculty || "MET",
          extraRequiredResource: found.extraRequiredResource || "",
          capacity: Number(found.capacity ?? 10),
        });
      } catch (e) {
        setError(
          e?.response?.data?.message || e?.message || "Failed to load workshop."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setOk(null);

    // Validations (same as Create)
    if (!form.title || form.title.trim().length < 4)
      return setError("Title must be at least 4 characters.");
    if (!form.startAt || !form.endAt)
      return setError("Start and end date/time are required.");
    if (!isAfter(form.endAt, form.startAt))
      return setError("End time must be after start time.");
    if (!form.registrationDeadline)
      return setError("Registration deadline is required.");
    if (isAfter(form.registrationDeadline, form.startAt))
      return setError("Registration deadline must be before the start.");
    if (!form.desc) return setError("Short description is required.");
    if (!form.fullAgenda) return setError("Full agenda is required.");
    if (!form.capacity || Number(form.capacity) < 1)
      return setError("Capacity must be at least 1.");

    // Map to Joi schema (same keys as create)
    const payload = {
      type: "workshop",
      title: form.title.trim(),
      location: form.location,
      startDate: new Date(form.startAt).toISOString(),
      endDate: new Date(form.endAt).toISOString(),
      registrationDeadline: new Date(form.registrationDeadline).toISOString(),
      requiredBudget: Number(form.requiredBudget) || 0,
      fundraisingSource: form.fundraisingSource,
      desc: form.desc.trim(),
      fullAgenda: form.fullAgenda.trim(),
      responsibleFaculty: form.responsibleFaculty,
      extraRequiredResource: (form.extraRequiredResource || "").trim(),
      capacity: Number(form.capacity),
      // Do NOT send professors/createdBy/status; backend manages those.
    };

    try {
      setSaving(true);
      const resp = await updateWorkshop(id, payload); // { message, workshop }
      setOk(resp?.message || "Workshop updated.");
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  // UI
  if (loading) {
    return (
      <div className="form-container">
        <h1 className="form-title">Edit Workshop</h1>
        <div>Loading…</div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h1 className="form-title">Edit Workshop</h1>

      {ok && <div className="alert alert--ok">{ok}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      <form onSubmit={onSubmit} className="form-grid">
        <div className="full">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>

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
            ].map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

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

        <div className="full">
          <label className="form-label">Short Description</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={form.desc}
            onChange={(e) => update("desc", e.target.value)}
          />
        </div>

        <div className="full">
          <label className="form-label">Full Agenda</label>
          <textarea
            className="form-textarea"
            rows={6}
            value={form.fullAgenda}
            onChange={(e) => update("fullAgenda", e.target.value)}
          />
        </div>

        <div className="full">
          <label className="form-label">Extra Required Resource</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={form.extraRequiredResource}
            onChange={(e) => update("extraRequiredResource", e.target.value)}
          />
        </div>

        <div className="btn-row full">
          <button className="btn" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

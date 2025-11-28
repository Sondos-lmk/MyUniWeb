import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
  const navigate = useNavigate();

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
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-cyan-600 font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Edit Workshop</h1>
            <div>Loading…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-slate-600 hover:text-cyan-600 font-medium"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-slate-800">Edit Workshop</h1>

      {ok && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{ok}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
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
              ].map((f) => (
                <option key={f} value={f}>
                  {f}
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
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={3}
            value={form.desc}
            onChange={(e) => update("desc", e.target.value)}
          />
        </div>

        {/* Full Agenda */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Agenda</label>
          <textarea
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={6}
            value={form.fullAgenda}
            onChange={(e) => update("fullAgenda", e.target.value)}
          />
        </div>

        {/* Extra Resources */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Extra Required Resource</label>
          <textarea
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={3}
            value={form.extraRequiredResource}
            onChange={(e) => update("extraRequiredResource", e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}

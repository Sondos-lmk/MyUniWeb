import { useState, useEffect } from "react";
import API from "../services/api";

function ApplyBoothForm() {
  const [form, setForm] = useState({
    boothId: "",
    boothSize: "2x2",
    startDate: "",
    durationWeeks: 1,
    reps: [{ name: "", email: "" }],
  });

  const [booths, setBooths] = useState([]);
  const [message, setMessage] = useState("");

  // ✅ FIXED FETCH FUNCTION
  useEffect(() => {
    const fetchBooths = async () => {
      try {
        const res = await API.get("/events?type=booth");
        console.log("Fetched booths:", res.data);

        // Handle different backend shapes safely
        const boothsData =
          res.data?.events || res.data?.booths || res.data || [];

        // Filter only approved booths (safe guard)
        const approvedBooths = boothsData.filter(
          (b) => b.status === "approved"
        );

        setBooths(approvedBooths);
      } catch (err) {
        console.error("Error fetching booths:", err);
      }
    };
    fetchBooths();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRepChange = (index, field, value) => {
    const newReps = [...form.reps];
    newReps[index][field] = value;
    setForm({ ...form, reps: newReps });
  };

  const addRep = () => {
    if (form.reps.length < 5) {
      setForm({
        ...form,
        reps: [...form.reps, { name: "", email: "" }],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const booth = booths.find((b) => b._id === form.boothId);
    if (!booth) {
      setMessage("Selected booth not found.");
      return;
    }

    const start = new Date(form.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + form.durationWeeks * 7);

    // ✅ Safer check in case registeredVendors doesn't exist yet
    const overlapping =
      booth.registeredVendors?.some(
        (v) =>
          v.status === "approved" &&
          v.boothSize === form.boothSize &&
          ((start >= new Date(v.startDate) &&
            start <= new Date(v.endDate)) ||
            (end >= new Date(v.startDate) &&
              end <= new Date(v.endDate)) ||
            (start <= new Date(v.startDate) &&
              end >= new Date(v.endDate)))
      ) || false;

    if (overlapping) {
      setMessage(
        "This booth with the selected size is already booked during the selected period."
      );
      return;
    }

    try {
      const res = await API.post(`/events/booth/${form.boothId}/register`, {
        boothId: form.boothId,
        boothSize: form.boothSize,
        startDate: form.startDate,
        durationWeeks: form.durationWeeks,
        reps: form.reps,
      });
      setMessage(res.data?.message || "Application submitted successfully!");
    } catch (err) {
      console.error("Error submitting booth application:", err);
      setMessage(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl">
      <h2 className="text-xl font-bold mb-4">Apply for a Booth</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Booth Selection */}
        <select
          name="boothId"
          value={form.boothId}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select a Booth</option>
          {booths.map((booth) => (
            <option key={booth._id} value={booth._id}>
              {booth.title} ({booth.locationInPlatform})
            </option>
          ))}
        </select>

        {/* Booth Size */}
        <select
          name="boothSize"
          value={form.boothSize}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="2x2">2x2</option>
          <option value="4x4">4x4</option>
        </select>

        {/* Start Date */}
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        {/* Duration */}
        <select
          name="durationWeeks"
          value={form.durationWeeks}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          {[1, 2, 3, 4].map((w) => (
            <option key={w} value={w}>
              {w} Week{w > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        {/* Representatives */}
        <h3 className="font-semibold mt-2">Representatives</h3>
        {form.reps.map((rep, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              placeholder="Name"
              value={rep.name}
              onChange={(e) => handleRepChange(i, "name", e.target.value)}
              className="border p-2 rounded flex-1"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={rep.email}
              onChange={(e) => handleRepChange(i, "email", e.target.value)}
              className="border p-2 rounded flex-1"
              required
            />
          </div>
        ))}

        {form.reps.length < 5 && (
          <button
            type="button"
            onClick={addRep}
            className="text-blue-500 underline self-start"
          >
            + Add Another Representative
          </button>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mt-3"
        >
          Submit Application
        </button>
      </form>

      {message && (
        <p className="mt-3 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}

export default ApplyBoothForm;

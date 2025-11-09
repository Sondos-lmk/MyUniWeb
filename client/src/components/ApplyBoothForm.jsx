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

  useEffect(() => {
    const fetchBooths = async () => {
      try {
        const res = await API.get("/events?type=booth");
        const boothsData = res.data?.events || res.data?.booths || res.data || [];
        // Get all booths with their registered vendors so we can check availability
        const booths = boothsData
          .filter(b => b.status === "approved")
          .sort((a, b) => a.title.localeCompare(b.title));
        setBooths(booths);
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
      setForm({ ...form, reps: [...form.reps, { name: "", email: "" }] });
    }
  };

const isBoothAvailable = (booth) => {
  // If no dates selected yet, booth is available
  if (!form.startDate || !form.durationWeeks) return true;

  // Calculate requested booking period
  const requestedStart = new Date(form.startDate);
  const requestedEnd = new Date(form.startDate);
  requestedEnd.setDate(requestedEnd.getDate() + Number(form.durationWeeks) * 7 - 1);

  // Find any approved booking that would overlap with our dates
  const hasApprovedBooking = booth.registeredVendors?.some(booking => {
    // Only check approved bookings
    if (booking.status !== 'approved') return false;

    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);

    // Check if dates overlap
    return requestedStart <= bookingEnd && requestedEnd >= bookingStart;
  });

  // Booth is available if there are no approved overlapping bookings
  return !hasApprovedBooking;
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    const booth = booths.find((b) => b._id === form.boothId);
    if (!booth) {
      setMessage("Selected booth not found.");
      return;
    }

    // Double check availability before submitting
    const available = isBoothAvailable(booth);
    if (!available) {
      setMessage("This booth is already booked for the selected dates.");
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

  // Booth rows
  const topRow = booths.slice(0, 3);
  const bottomRow = booths.slice(3, 6);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Apply for a Booth</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        {/* 👇 Added section titles for clarity */}
        <label className="font-semibold text-lg">Select Booth Size:</label>
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

        <label className="font-semibold text-lg mt-5">Select Start Date:</label>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <label className="font-semibold text-lg">Select Duration (Weeks):</label>
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

        {/* ✅ Booth Map (after size/date selection) */}
        <div className="relative bg-gray-200 p-6 rounded mt-5 mb-6 flex flex-col items-center gap-6">
          {/* Corner Labels */}
          <div className="absolute top-2 left-2 bg-amber-800 text-white text-xs font-semibold px-2 py-1 rounded">
            Pronto
          </div>
          <div className="absolute top-2 right-2 bg-amber-800 text-white text-xs font-semibold px-2 py-1 rounded">
            L'Aroma
          </div>
          <div className="absolute bottom-2 left-2 bg-amber-800 text-white text-xs font-semibold px-2 py-1 rounded">
            Friends
          </div>
          <div className="absolute bottom-2 right-2 bg-amber-800 text-white text-xs font-semibold px-2 py-1 rounded">
            Pasta Station
          </div>

          {/* Top Row */}
          <div className="flex justify-center gap-6 mt-6">
            {topRow.map((booth) => {
              const available = isBoothAvailable(booth);
              return (
                <button
                  key={booth._id}
                  onClick={() =>
                    available && setForm({ ...form, boothId: booth._id })
                  }
                  disabled={!available}
                  className={`px-3 py-1 rounded border ${
                    form.boothId === booth._id
                      ? "bg-blue-600 text-white"
                      : available
                      ? "bg-white"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                >
                  {booth.title}
                </button>
              );
            })}
          </div>

          {/* Center Platform */}
          <div className="w-75 h-50 bg-green-300 flex items-center justify-center text-white font-bold rounded shadow-inner">
            Platform
          </div>

          {/* Bottom Row */}
          <div className="flex justify-center gap-6 mb-6">
            {bottomRow.map((booth) => {
              const available = isBoothAvailable(booth);
              return (
                <button
                  key={booth._id}
                  onClick={() =>
                    available && setForm({ ...form, boothId: booth._id })
                  }
                  disabled={!available}
                  className={`px-3 py-1 rounded border ${
                    form.boothId === booth._id
                      ? "bg-blue-600 text-white"
                      : available
                      ? "bg-white"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                >
                  {booth.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reps */}
        <h3 className="font-semibold mt-2">Booth Representatives</h3>
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

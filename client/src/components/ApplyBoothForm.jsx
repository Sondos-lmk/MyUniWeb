import { useState, useEffect } from "react";
import API from "../services/api";
import ModernAlert from "./ui/ModernAlert";

function ApplyBoothForm() {
  const [form, setForm] = useState({
    boothId: "",
    boothSize: "2x2",
    startDate: "",
    durationWeeks: 1,
    reps: [{ name: "", email: "" }],
  });
  const [booths, setBooths] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  // Fetch booths on mount
  useEffect(() => {
    const fetchBooths = async () => {
      try {
        const res = await API.get("/events?type=booth");
        const boothsData = res.data?.events || res.data?.booths || res.data || [];
        const approvedBooths = boothsData
          .filter(b => b.status === "approved")
          .sort((a, b) => a.title.localeCompare(b.title));
        setBooths(approvedBooths);
      } catch (err) {
        console.error("Error fetching booths:", err);
      }
    };
    fetchBooths();
  }, []);

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  // Handle general form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle reps input changes
  const handleRepChange = (index, field, value) => {
    const newReps = [...form.reps];
    newReps[index][field] = value;
    setForm({ ...form, reps: newReps });
  };

  // Add a new representative
  const addRep = () => {
    if (form.reps.length < 5) {
      setForm({ ...form, reps: [...form.reps, { name: "", email: "" }] });
    }
  };

  // Selected booth and estimated price calculation
  const selectedBooth = booths.find(b => b._id === form.boothId);
  let estimatedPrice = 0;
  if (selectedBooth && form.startDate) {
    const start = new Date(form.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + Number(form.durationWeeks) * 7 - 1);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const sizeMultiplier = form.boothSize === "4x4" ? 1.5 : 1;
    estimatedPrice = selectedBooth.basePricePerDay * days * sizeMultiplier;
  }

  // Check booth availability
  const isBoothAvailable = (booth) => {
    if (!form.startDate || !form.durationWeeks) return true;

    const requestedStart = new Date(form.startDate);
    const requestedEnd = new Date(form.startDate);
    requestedEnd.setDate(requestedEnd.getDate() + Number(form.durationWeeks) * 7 - 1);

    const hasApprovedBooking = booth.registeredVendors?.some(booking => {
      if (booking.status !== 'approved') return false;
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      return requestedStart <= bookingEnd && requestedEnd >= bookingStart;
    });

    return !hasApprovedBooking;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBooth) {
      showAlert("Selected booth not found.", "error");
      return;
    }

    if (!isBoothAvailable(selectedBooth)) {
      showAlert("This booth is already booked for the selected dates.", "error");
      return;
    }

    try {
      const res = await API.post(`/events/booth/${form.boothId}/register`, form);
      showAlert(res.data?.message || "Application submitted successfully!", "success");
      // Reset form on success
      setForm({
        boothId: "",
        boothSize: "2x2",
        startDate: "",
        durationWeeks: 1,
        reps: [{ name: "", email: "" }],
      });
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.error || "Something went wrong.", "error");
    }
  };

  // Divide booths into top/bottom rows
  const topRow = booths.slice(0, 3);
  const bottomRow = booths.slice(3, 6);

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold  text-gray-900 text-center mb-3">Apply for a Booth</h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
        >
          {/* Booth Size */}
          <div className="flex flex-col">
            <label className="font-semibold">Booth Size:</label>
            <select
              name="boothSize"
              value={form.boothSize}
              onChange={handleChange}
              className="border rounded p-2 mt-1"
            >
              <option value="2x2">2x2 (Standard)</option>
              <option value="4x4">4x4 (Premium)</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col">
            <label className="font-semibold">Start Date:</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="border rounded p-2 mt-1"
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col">
            <label className="font-semibold">Duration (Weeks):</label>
            <select
              name="durationWeeks"
              value={form.durationWeeks}
              onChange={handleChange}
              className="border rounded p-2 mt-1"
            >
              {[1, 2, 3, 4].map(w => <option key={w} value={w}>{w} Week{w > 1 ? "s" : ""}</option>)}
            </select>
          </div>

          {/* Platform Map */}
          <div className="mt-4">
            <label className="block font-semibold text-slate-800 mb-3">
              Select Your Booth Location:
            </label>

            <div className="flex flex-col items-center gap-4">

              {/* ---- TOP ROAD (D Building) ---- */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-slate-600">D Building</span>
                <span className="text-sm font-semibold text-slate-600">↓</span>

                {/* Shorter vertical road */}
                <div className="relative w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <div className="h-1 w-8 bg-white"></div>
                    <div className="h-1 w-8 bg-white"></div>
                    <div className="h-1 w-8 bg-white"></div>
                  </div>
                </div>
              </div>

              {/* ---- PLATFORM BOX ---- */}
              <div
                className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-8"
                style={{ width: "600px", height: "450px" }}
              >
                {/* Platform Label */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                              text-blue-600 font-bold text-2xl opacity-20 select-none">
                  PLATFORM
                </div>

                {/* Corner Restaurants */}
                <div className="absolute top-3 left-3 bg-stone-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-md">
                  Pronto
                </div>
                <div className="absolute top-3 right-3 bg-stone-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-md">
                  L'Aroma
                </div>
                <div className="absolute bottom-3 left-3 bg-stone-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-md">
                  Friends
                </div>
                <div className="absolute bottom-3 right-3 bg-stone-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-md">
                  Pasta Station
                </div>

                {/* Top Row Booths */}
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 flex justify-center gap-4 w-full px-8">
                  {topRow.map((booth) => {
                    const available = isBoothAvailable(booth);
                    return (
                      <button
                        type="button"
                        key={booth._id}
                        onClick={() => available && setForm({ ...form, boothId: booth._id })}
                        disabled={!available}
                        className={`px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${
                          form.boothId === booth._id
                            ? "bg-blue-600 text-white border-blue-700 shadow-lg scale-105"
                            : available
                            ? "bg-white text-slate-700 border-slate-300 hover:border-blue-500 hover:shadow-md"
                            : "bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed opacity-60"
                        }`}
                      >
                        {booth.title}
                        {!available && <span className="block text-xs mt-1">Booked</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Row Booths */}
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex justify-center gap-4 w-full px-8">
                  {bottomRow.map((booth) => {
                    const available = isBoothAvailable(booth);
                    return (
                      <button
                        type="button"
                        key={booth._id}
                        onClick={() => available && setForm({ ...form, boothId: booth._id })}
                        disabled={!available}
                        className={`px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${
                          form.boothId === booth._id
                            ? "bg-blue-600 text-white border-blue-700 shadow-lg scale-105"
                            : available
                            ? "bg-white text-slate-700 border-slate-300 hover:border-blue-500 hover:shadow-md"
                            : "bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed opacity-60"
                        }`}
                      >
                        {booth.title}
                        {!available && <span className="block text-xs mt-1">Booked</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ---- BOTTOM ROAD (C Building) ---- */}
              <div className="flex flex-col items-center gap-1">
                {/* Short vertical road */}
                <div className="relative w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <div className="h-1 w-8 bg-white"></div>
                    <div className="h-1 w-8 bg-white"></div>
                    <div className="h-1 w-8 bg-white"></div>
                  </div>
                </div>

                <span className="text-sm font-semibold text-slate-600">↑</span>
                <span className="text-sm font-semibold text-slate-600">C Building</span>
              </div>
            </div>
          </div>

          {/* Selected Booth Info */}
          {selectedBooth && (
            <div className="p-4 border rounded bg-gray-50">
              <p><span className="font-semibold">Booth Location:</span> {selectedBooth.locationInPlatform || "N/A"}</p>
              <p><span className="font-semibold">Estimated Price:</span> {estimatedPrice.toLocaleString()} EGP</p>
            </div>
          )}

          {/* Representatives */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Representatives</h3>
            {form.reps.map((rep, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={rep.name}
                  onChange={(e) => handleRepChange(i, "name", e.target.value)}
                  className="flex-1 border rounded p-2"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={rep.email}
                  onChange={(e) => handleRepChange(i, "email", e.target.value)}
                  className="flex-1 border rounded p-2"
                  required
                />
                {form.reps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, reps: form.reps.filter((_, idx) => idx !== i) })}
                    className="px-2 py-1 rounded text-red-600 font-bold hover:bg-red-100"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {form.reps.length < 5 && (
              <button type="button" onClick={addRep} className="text-teal-600 underline self-start">
                + Add Representative
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Submit Application
          </button>
        </form>
      </div>

      {/* Modern Alert */}
      <ModernAlert 
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />
    </>
  );
}

export default ApplyBoothForm;
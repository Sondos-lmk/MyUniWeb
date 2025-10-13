import { useState } from "react";
import API from "../services/api";

function ApplyBoothForm() {
  const [form, setForm] = useState({
    boothId: "",
    startDate: "",
    durationWeeks: 1,
    reps: [{ name: "", email: "" }],
    boothSize: "2x2",
    location: "",
  });

  const [message, setMessage] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/events/booth/${form.boothId}/register`, {
     boothId: form.boothId,
        startDate: form.startDate,
        durationWeeks: form.durationWeeks,
        reps: form.reps,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl">
      <h2 className="text-xl font-bold mb-4">Apply for a Booth</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="boothId"
          placeholder="Booth ID"
          value={form.boothId}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <select
          name="durationWeeks"
          value={form.durationWeeks}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value={1}>1 Week</option>
          <option value={2}>2 Weeks</option>
          <option value={3}>3 Weeks</option>
          <option value={4}>4 Weeks</option>
        </select>

        <h3 className="font-semibold mt-2">Representatives</h3>
        {form.reps.map((rep, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              placeholder="Name"
              value={rep.name}
              onChange={(e) => handleRepChange(i, "name", e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <input
              type="email"
              placeholder="Email"
              value={rep.email}
              onChange={(e) => handleRepChange(i, "email", e.target.value)}
              className="border p-2 rounded flex-1"
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

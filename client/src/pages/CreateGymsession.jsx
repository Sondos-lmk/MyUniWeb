import React, { useState } from "react";
import  api  from "../services/api";

export default function CreateGymSession() {
  const [form, setForm] = useState({
    date: "",
    time: "",
    duration: "",
    maxParticipants: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/gym", form);
      setMessage("✅ Gym session created successfully!");
      setForm({ date: "", time: "", duration: "", maxParticipants: "" });
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Gym Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border rounded-lg w-full p-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Time</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="border rounded-lg w-full p-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            className="border rounded-lg w-full p-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Max Participants</label>
          <input
            type="number"
            name="maxParticipants"
            value={form.maxParticipants}
            onChange={handleChange}
            className="border rounded-lg w-full p-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
        >
          {loading ? "Creating..." : "Create Session"}
        </button>

        {message && <p className="text-center mt-3">{message}</p>}
      </form>
    </div>
  );
}

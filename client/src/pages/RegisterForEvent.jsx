import React, { useState } from "react";
import API from "../services/api";

export default function RegisterForEvent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [uniID, setUniID] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simulate successful registration (no backend call)
    setMessage("Registering...");
    setTimeout(() => {
      setMessage("✅ Successfully registered!");
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Register for Workshop/Trip
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:ring focus:ring-blue-300"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:ring focus:ring-blue-300"
          required
        />
        <input
          type="text"
          placeholder="Student/Staff ID"
          value={uniID}
          onChange={(e) => setUniID(e.target.value)}
          className="w-full p-3 border rounded-lg mb-3 focus:ring focus:ring-blue-300"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Register
        </button>

        {message && (
          <p className="text-center mt-3 text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
  
}

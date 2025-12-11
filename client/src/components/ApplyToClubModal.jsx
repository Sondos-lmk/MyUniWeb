import React, { useState } from "react";
import Modal from "./ui/Modal";

export default function ApplyToClubModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    gucId: "",
    phone: "",
    motivation: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(form);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Apply to Club">
      <div className="space-y-4">

        <div>
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="name"
            className="w-full mt-1 border px-3 py-2 rounded-lg"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">GUC ID</label>
          <input
            type="text"
            name="gucId"
            className="w-full mt-1 border px-3 py-2 rounded-lg"
            value={form.gucId}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            name="phone"
            className="w-full mt-1 border px-3 py-2 rounded-lg"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Motivation</label>
          <textarea
            name="motivation"
            className="w-full mt-1 border px-3 py-2 rounded-lg"
            rows={4}
            value={form.motivation}
            onChange={handleChange}
          />
        </div>

        {/* BUTTON ROW */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 
                       text-white font-semibold hover:from-cyan-700 hover:to-blue-800"
          >
            Submit Application
          </button>
        </div>
      </div>
    </Modal>
  );
}

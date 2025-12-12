import React, { useState } from "react";
import Modal from "./ui/Modal";

export default function ApplyToClubModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    gucId: "",
    phone: "",
    email:"",
    major:"",
    motivation: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(form);
    onClose();
  };
  const inputClass =
  "w-full border border-slate-300 rounded-lg px-3 py-2 " +
  "focus:outline-none focus:ring-2 focus:ring-cyan-500";

  return (
    <Modal open={open} onClose={onClose} title="Apply to Club">
      <div className="space-y-4">

        <div>
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="name"
            className={inputClass}
            placeholder="Malak Wael"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">GUC ID</label>
          <input
            type="text"
            name="gucId"
            className={inputClass}
            placeholder="58-1234"
            value={form.gucId}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            name="phone"
            className={inputClass}
            placeholder="01140446969"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
          <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            placeholder="student@guc.edu.eg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Major
          </label>
          <input
            type="text"
            name="major"
            value={form.major}
            onChange={handleChange}
            className={inputClass}
            placeholder="Computer Engineering"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Motivation</label>
          <textarea
            name="motivation"
            className={`${inputClass} resize-none`}
            placeholder="Reason why you want to join"
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

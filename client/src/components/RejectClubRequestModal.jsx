import React, { useState } from "react";
import Modal from "./ui/Modal";

export default function RejectClubRequestModal({ open, onClose, onSubmit, clubName }) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason.trim());
    setReason("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Reject Club Request">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          You are rejecting: <span className="font-semibold">{clubName}</span>
        </p>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Rejection reason
          </label>
          <textarea
            placeholder="Write a clear reason the student can act on..."
            className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      </div>
    </Modal>
  );
}

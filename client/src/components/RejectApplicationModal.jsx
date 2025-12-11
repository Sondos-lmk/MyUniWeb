import React, { useState } from "react";
import Modal from "./ui/Modal";

export default function RejectApplicationModal({ open, onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason);
    onClose();
    setReason("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Reject Applicant">
      <div className="space-y-4">

        <div>
          <label className="text-sm font-medium text-gray-700">Rejection Reason</label>
          <textarea
            className="w-full mt-1 border px-3 py-2 rounded-lg"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
          >
            Reject Applicant
          </button>
        </div>

      </div>
    </Modal>
  );
}

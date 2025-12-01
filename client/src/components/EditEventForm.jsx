import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./ui/Modal";
import ModernAlert from "./ui/ModernAlert";

export default function EditEventForm({ eventId, onClose }) {
  const token = localStorage.getItem("token");

  const [eventType, setEventType] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  // Load event data when modal opens
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/events/${eventId}`);
        const event = res.data;
        setEventType(event.type);
        setFormData(event);

        const now = new Date();
        if (new Date(event.startDate) <= now) setIsReadOnly(true);
      } catch (err) {
        console.error("Error loading event:", err);
        showAlert("Failed to load event data", "error");
      }
    })();
  }, [eventId]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    setLoading(true);
    try {
      let url = "";
      let method = "patch";

      if (eventType === "bazaar")
        url = `http://localhost:4000/api/events/${eventId}/updateBazaar`;
      else if (eventType === "conference")
        url = `http://localhost:4000/api/events/${eventId}/updateConf`;
      else
        url = `http://localhost:4000/api/events/${eventId}`;

      await axios[method](url, { type: eventType, ...formData }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showAlert("Event updated successfully!", "success");
      onClose(); // close modal
      window.location.reload(); // refresh dashboard
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update event";
      showAlert(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    "block text-sm font-semibold text-gray-800 mt-3 mb-1";

  const inputProps = {
    onChange: handleChange,
    disabled: isReadOnly,
    className:
      "border border-gray-300 p-2 rounded-md w-full disabled:bg-gray-100",
  };

  // Same renderFormFields function—unchanged
  const renderFormFields = () => {
    switch (eventType) {
      case "trip":
        return (
          <>
            <input name="title" value={formData.title || ""} placeholder="Trip Name" {...inputProps} />
            <input name="location" value={formData.location || ""} placeholder="Location" {...inputProps} />
            <input name="price" type="number" value={formData.price || ""} placeholder="Price (EGP)" {...inputProps} />

            <label className={labelClass}>Start Date</label>
            <input name="startDate" type="datetime-local" value={formData.startDate?.slice(0,16) || ""} {...inputProps} />

            <label className={labelClass}>End Date</label>
            <input name="endDate" type="datetime-local" value={formData.endDate?.slice(0,16) || ""} {...inputProps} />

            <textarea name="desc" value={formData.desc || ""} placeholder="Description" {...inputProps} />
            <input name="capacity" type="number" value={formData.capacity || ""} placeholder="Capacity" {...inputProps} />

            <label className={labelClass}>Registration Deadline</label>
            <input name="registrationDeadline" type="datetime-local" value={formData.registrationDeadline?.slice(0,16) || ""} {...inputProps} />
          </>
        );

      case "bazaar":
        return (
          <>
            <input name="title" value={formData.title || ""} placeholder="Bazaar Name" {...inputProps} />
            <input name="location" value={formData.location || ""} placeholder="Location" {...inputProps} />

            <label className={labelClass}>Start Date</label>
            <input name="startDate" type="datetime-local" value={formData.startDate?.slice(0,16) || ""} {...inputProps} />

            <label className={labelClass}>End Date</label>
            <input name="endDate" type="datetime-local" value={formData.endDate?.slice(0,16) || ""} {...inputProps} />

            <textarea name="desc" value={formData.desc || ""} placeholder="Description" {...inputProps} />

            <label className={labelClass}>Registration Deadline</label>
            <input name="registrationDeadline" type="datetime-local" value={formData.registrationDeadline?.slice(0,16) || ""} {...inputProps} />
          </>
        );

      case "conference":
        return (
          <>
            <input name="title" value={formData.title || ""} placeholder="Conference Name" {...inputProps} />

            <label className={labelClass}>Start Date</label>
            <input name="startDate" type="datetime-local" value={formData.startDate?.slice(0,16) || ""} {...inputProps} />

            <label className={labelClass}>End Date</label>
            <input name="endDate" type="datetime-local" value={formData.endDate?.slice(0,16) || ""} {...inputProps} />

            <textarea name="desc" value={formData.desc || ""} placeholder="Short Description" {...inputProps} />
            <textarea name="fullAgenda" value={formData.fullAgenda || ""} placeholder="Full Agenda" {...inputProps} />

            <input name="websiteLink" value={formData.websiteLink || ""} placeholder="Website Link" {...inputProps} />

            <input name="requiredBudget" type="number" value={formData.requiredBudget || ""} placeholder="Required Budget (EGP)" {...inputProps} />

            <select name="fundraisingSource" value={formData.fundraisingSource || ""} {...inputProps}>
              <option value="">Select Funding Source</option>
              <option value="GUC">GUC</option>
              <option value="External">External</option>
            </select>

            <textarea name="extraRequiredResource" value={formData.extraRequiredResource || ""} placeholder="Extra Resources" {...inputProps} />

            <label className={labelClass}>Registration Deadline</label>
            <input name="registrationDeadline" type="datetime-local" value={formData.registrationDeadline?.slice(0,16) || ""} {...inputProps} />
          </>
        );

      default:
        return <p className="text-gray-600">Loading...</p>;
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">Edit Event</h2>

      {isReadOnly && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md mb-3">
          ⚠️ This event has started and cannot be edited.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {renderFormFields()}

        {!isReadOnly && (
          <button
            type="submit"
            disabled={loading}
            className="bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
          >
            {loading ? "Saving..." : "Update Event"}
          </button>
        )}
      </form>

      {alertMessage && (
        <ModernAlert
          message={alertMessage}
          type={alertType}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </Modal>
  );
}

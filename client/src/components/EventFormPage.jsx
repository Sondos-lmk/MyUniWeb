import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function EventFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [eventType, setEventType] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // 🔹 Load event if editing
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await axios.get(`http://localhost:4000/api/events/${id}`);
          const event = res.data;
          setEventType(event.type);
          setFormData(event);

          // ⛔ Disable editing if event has started
          const now = new Date();
          if (new Date(event.startDate) <= now) {
            setIsReadOnly(true);
          }
        } catch (err) {
          console.error("Error loading event:", err);
          alert("Failed to load event data");
        }
      })();
    }
  }, [id]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    setLoading(true);
    try {
      let url = "";
      let method = id ? "patch" : "post";

      if (id) {
        if (eventType === "bazaar")
          url = `http://localhost:4000/api/events/${id}/updateBazaar`;
        else if (eventType === "conference")
          url = `http://localhost:4000/api/events/${id}/updateConf`;
        else url = `http://localhost:4000/api/events/${id}`;
      } else {
        if (eventType === "conference")
          url = `http://localhost:4000/api/events/createConference`;
        else if (eventType === "bazaar")
          url = `http://localhost:4000/api/events/createBazaar`;
        else url = `http://localhost:4000/api/events/`;
      }

      await axios[method](url, { type: eventType, ...formData }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Event ${id ? "updated" : "created"} successfully!`);
      navigate("/eventOfficer/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to submit event");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-sm font-semibold text-gray-800 mt-3 mb-1";

  const inputProps = {
    onChange: handleChange,
    disabled: isReadOnly,
    className: "border border-gray-300 p-2 rounded-md w-full disabled:bg-gray-100",
  };

  const renderFormFields = () => {
    switch (eventType) {
      case "trip":
        return (
          <>
            <input name="title" value={formData.title || ""} placeholder="Trip Name" {...inputProps} />
            <input name="location" value={formData.location || ""} placeholder="Location" {...inputProps} />
            <input name="price" type="number" value={formData.price || ""} placeholder="Price (EGP)" {...inputProps} />
            <label className={labelClass}>Start Date & Time</label>
            <input name="startDate" type="datetime-local" value={formData.startDate?.slice(0, 16) || ""} {...inputProps} />
            <label className={labelClass}>End Date & Time</label>
            <input name="endDate" type="datetime-local" value={formData.endDate?.slice(0, 16) || ""} {...inputProps} />
            <textarea name="desc" value={formData.desc || ""} placeholder="Short Description" {...inputProps} />
            <input name="capacity" type="number" value={formData.capacity || ""} placeholder="Capacity" {...inputProps} />
            <label className={labelClass}>Registration Deadline</label>
            <input name="registrationDeadline" type="datetime-local" value={formData.registrationDeadline?.slice(0, 16) || ""} {...inputProps} />
          </>
        );

      case "bazaar":
        return (
          <>
            <input name="title" value={formData.title || ""} placeholder="Bazaar Name" {...inputProps} />
            <input name="location" value={formData.location || ""} placeholder="Location" {...inputProps} />
            <label className={labelClass}>Start Date & Time</label>
            <input name="startDate" type="datetime-local" value={formData.startDate?.slice(0, 16) || ""} {...inputProps} />
            <label className={labelClass}>End Date & Time</label>
            <input name="endDate" type="datetime-local" value={formData.endDate?.slice(0, 16) || ""} {...inputProps} />
            <textarea name="desc" value={formData.desc || ""} placeholder="Short Description" {...inputProps} />
            <label className={labelClass}>Registration Deadline</label>
            <input name="registrationDeadline" type="datetime-local" value={formData.registrationDeadline?.slice(0, 16) || ""} {...inputProps} />
          </>
        );

      case "conference":
        return (
          <>
            <input name="title" value={formData.title || ""} placeholder="Conference Name" {...inputProps} />
            <label className={labelClass}>Start Date & Time</label>
            <input name="startDate" type="datetime-local" value={formData.startDate?.slice(0, 16) || ""} {...inputProps} />
            <label className={labelClass}>End Date & Time</label>
            <input name="endDate" type="datetime-local" value={formData.endDate?.slice(0, 16) || ""} {...inputProps} />
            <textarea name="desc" value={formData.desc || ""} placeholder="Short Description" {...inputProps} />
            <textarea name="fullAgenda" value={formData.fullAgenda || ""} placeholder="Full Agenda" {...inputProps} />
            <input name="websiteLink" value={formData.websiteLink || ""} placeholder="Conference Website Link" {...inputProps} />
            <input name="requiredBudget" type="number" value={formData.requiredBudget || ""} placeholder="Required Budget (EGP)" {...inputProps} />
            <select name="fundraisingSource" value={formData.fundraisingSource || ""} {...inputProps}>
              <option value="">Select Funding Source</option>
              <option value="GUC">GUC</option>
              <option value="External">External</option>
            </select>
            <textarea name="extraRequiredResource" value={formData.extraRequiredResource || ""} placeholder="Extra Required Resources" {...inputProps} />
            <label className={labelClass}>Registration Deadline</label>
            <input name="registrationDeadline" type="datetime-local" value={formData.registrationDeadline?.slice(0, 16) || ""} {...inputProps} />
          </>
        );

      default:
        return <p className="text-gray-600">Select event type to continue.</p>;
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{id ? "Edit Event" : "Create Event"}</h1>

      {isReadOnly && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4 font-medium">
          ⚠️ This event has already started and can no longer be edited.
        </div>
      )}

      {!id && (
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">Select Event Type</label>
          <select
            className="border border-gray-300 p-2 rounded-md w-full"
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value);
              setFormData({});
            }}
          >
            <option value="">-- Choose Type --</option>
            <option value="trip">Trip</option>
            <option value="bazaar">Bazaar</option>
            <option value="conference">Conference</option>
          </select>
        </div>
      )}

      {eventType && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-gray-200 p-6 rounded-xl shadow-sm">
          {renderFormFields()}

          {!isReadOnly && (
            <button
              type="submit"
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md mt-4"
            >
              {loading ? "Saving..." : id ? "Update Event" : "Create Event"}
            </button>
          )}
        </form>
      )}
    </div>
  );
}

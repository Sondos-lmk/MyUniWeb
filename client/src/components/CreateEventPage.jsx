import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateEventPage() {
  const [eventType, setEventType] = useState("");
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url =
        eventType === "conference"
          ? "http://localhost:4000/api/events/createConference"
          : "http://localhost:4000/api/events/";

      const res = await axios.post(
        url,
        { type: eventType, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`${eventType} created successfully!`);
      navigate("/eventOfficer/dashboard"); // redirect after success
    } catch (error) {
      console.error(error);
      alert("Failed to create event");
    }
  };

  const renderFormFields = () => {
  const labelClass = "block text-sm font-semibold text-gray-800 mt-3 mb-1";

  switch (eventType) {
    case "trip":
      return (
        <>
          <input name="title" placeholder="Trip Name" onChange={handleChange} required />

          <input name="location" placeholder="Location" onChange={handleChange} required />

          <input name="price" type="number" placeholder="Price (EGP)" onChange={handleChange} required />

          <label className={labelClass}>Start Date & Time</label>
          <input name="startDate" type="datetime-local" onChange={handleChange} required />

          <label className={labelClass}>End Date & Time</label>
          <input name="endDate" type="datetime-local" onChange={handleChange} required />

          <textarea name="desc" placeholder="Short Description" onChange={handleChange}></textarea>

          <input name="capacity" type="number" placeholder="Capacity" onChange={handleChange} required />

          <label className={labelClass}>Registration Deadline</label>
          <input name="registrationDeadline" type="datetime-local" onChange={handleChange} required />
        </>
      );

    case "bazaar":
      return (
        <>
          <input name="title" placeholder="Bazaar Name" onChange={handleChange} required />

          <input name="location" placeholder="Location" onChange={handleChange} required />

          <label className={labelClass}>Start Date & Time</label>
          <input name="startDate" type="datetime-local" onChange={handleChange} required />

          <label className={labelClass}>End Date & Time</label>
          <input name="endDate" type="datetime-local" onChange={handleChange} required />

          <textarea name="desc" placeholder="Short Description" onChange={handleChange}></textarea>

          <label className={labelClass}>Registration Deadline</label>
          <input name="registrationDeadline" type="datetime-local" onChange={handleChange} required />
        </>
      );

    case "conference":
      return (
        <>
          <input name="title" placeholder="Conference Name" onChange={handleChange} required />

          <label className={labelClass}>Start Date & Time</label>
          <input name="startDate" type="datetime-local" onChange={handleChange} required />

          <label className={labelClass}>End Date & Time</label>
          <input name="endDate" type="datetime-local" onChange={handleChange} required />

          <textarea name="desc" placeholder="Short Description" onChange={handleChange}></textarea>

          <textarea name="fullAgenda" placeholder="Full Agenda" onChange={handleChange}></textarea>

          <input name="websiteLink" placeholder="Conference Website Link" onChange={handleChange} required />

          <input name="requiredBudget" type="number" placeholder="Required Budget (EGP)" onChange={handleChange} />

          <select name="fundraisingSource" onChange={handleChange}>
            <option value="">Select Funding Source</option>
            <option value="GUC">GUC</option>
            <option value="External">External</option>
          </select>

          <textarea name="extraRequiredResource" placeholder="Extra Required Resources" onChange={handleChange}></textarea>

          <label className={labelClass}>Registration Deadline</label>
          <input name="registrationDeadline" type="datetime-local" onChange={handleChange} />
        </>
      );

    default:
      return <p className="text-gray-600">Select an event type to fill in the details.</p>;
  }
};



  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Event</h1>

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

      {eventType && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 border border-gray-200 p-6 rounded-xl shadow-sm"
        >
          {renderFormFields()}

          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md mt-4"
          >
            Create {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
          </button>
        </form>
      )}
    </div>
  );
}

export default CreateEventPage;

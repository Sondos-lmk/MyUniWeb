import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function MyRegisteredEvents() {
  // 1. Renamed state for clarity
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user's registered events when component loads
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events/my-registered");
        // 2. Set the new registration data
        setRegistrations(res.data);
      } catch (err) {
        console.error("Error fetching registered events:", err);
        setError(
          err.response?.data?.error || "Failed to load your registered events."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Helper function to add color to the payment status
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "not paid":
        return "text-red-600";
      case "refunded":
        return "text-gray-600";
      default:
        return "text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading your events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        My Registered Events
      </h1>

      {/* 3. Check the length of registrations */}
      {registrations.length === 0 ? (
        <p className="text-center text-gray-600">
          You haven’t registered for any events yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 4. Map over 'registrations' and call each item 'reg' */}
          {registrations.map((reg) => (
            <div
              // 5. The key is now inside reg.event._id
              key={reg.event._id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              {/* 6. All event data is now inside reg.event */}
              <h2 className="text-xl font-semibold text-blue-700 mb-2">
                {reg.event.title || "Untitled Event"}
              </h2>
              <p className="text-gray-700 mb-1">
                <strong>Type:</strong> {reg.event.type || "N/A"}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Location:</strong> {reg.event.location || "N/A"}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Start Date:</strong>{" "}
                {reg.event.startDate
                  ? new Date(reg.event.startDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>End Date:</strong>{" "}
                {reg.event.endDate
                  ? new Date(reg.event.endDate).toLocaleDateString()
                  : "N/A"}
              </p>
              {reg.event.status &&
                (reg.event.type === "workshop" ||
                  reg.event.type === "booth") && (
                  <p className="text-gray-700 mb-1">
                    <strong>Status:</strong> {reg.event.status}
                  </p>
                )}

              {/* 7. (NEW) Display the paymentStatus */}
              <p
                className={`font-semibold mt-4 pt-2 border-t border-gray-100 ${getStatusColor(
                  reg.paymentStatus
                )}`}
              >
                Payment Status: {reg.paymentStatus}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
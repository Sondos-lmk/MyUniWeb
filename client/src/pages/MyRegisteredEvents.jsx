import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function MyRegisteredEvents() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events/my-registered");
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

  // --- NEW: Placeholder functions for your buttons ---
  // You will need to implement the API calls for these
  const handlePayment = (eventId) => {
    console.log("User wants to pay for event:", eventId);
    // e.g., call your payment API or redirect to payment page
  };

  const handleRefund = (eventId) => {
    console.log("User wants to refund event:", eventId);
    // e.g., call your refund API endpoint
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

      {registrations.length === 0 ? (
        <p className="text-center text-gray-600">
          You haven’t registered for any events yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrations.map((reg) => (
            <div
              key={reg.event._id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between"
            >
              {/* Event Details Section */}
              <div>
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
              </div>

              {/* --- NEW: CONDITIONAL PAYMENT/REFUND SECTION --- */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                
                {/* Case 1: "not paid" */}
                {reg.paymentStatus === "not paid" && (
                  <>
                    <button
                      onClick={() => handlePayment(reg.event._id)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                    >
                      Pay Now
                    </button>
                  </>
                )}

                {/* Case 2: "paid" */}
                {reg.paymentStatus === "paid" && (
                  <>
                    <p className="text-sm font-semibold text-green-600 mb-2">
                      You have paid for this event
                    </p>
                    <button
                      onClick={() => handleRefund(reg.event._id)}
                      className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition"
                    >
                      Request Refund
                    </button>
                  </>
                )}

                {/* Case 3: "refunded" */}
                {reg.paymentStatus === "refunded" && (
                  <>
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                      You have refunded your money
                    </p>
                    <button
                      onClick={() => handlePayment(reg.event._id)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                    >
                      Pay Again
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
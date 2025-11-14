import React, { useEffect, useState } from "react";
import API from "../services/api"; // Your API service

export default function MyRegisteredEvents() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // --- NEW STATE FOR MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // Stores the event being paid for
  const [paymentError, setPaymentError] = useState(""); // For errors in the moda

  useEffect(() => {
    fetchEvents();
  }, []);

  // --- FETCH/REFRESH FUNCTION ---
  const fetchEvents = async () => {
    setLoading(true);
    try {
      console.log("Fetching registered events...");
      const res = await API.get("/events/my-registered");
      console.log("Response:", res.data);
      setRegistrations(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching registered events:", err);
      console.error("Error details:", err.response);
      setError(
        err.response?.data?.error || err.response?.data?.message || err.message || "Failed to load your registered events."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- (MODIFIED) STEP 1: OPEN MODAL ---
  // This is called when the user clicks "Pay Now" or "Pay Again"
  const handlePayment = (registration) => {
    setSelectedEvent(registration); // Save the whole registration object
    setPaymentError(""); // Clear old errors
    setIsModalOpen(true);
  };

  // --- (NEW) STEP 2: HANDLE WALLET PAYMENT ---
  const handleWalletPayment = async () => {
    if (!selectedEvent) return;
    
    setLoading(true); // Show a loading state
    setPaymentError("");

    try {
      await API.post("/payment/pay-with-wallet", { 
        eventId: selectedEvent.event._id 
      });
      
      // Success! Close modal and refresh events
      setIsModalOpen(false);
      setSelectedEvent(null);
      await fetchEvents(); // Re-fetch to show "Paid" status

    } catch (err) {
      console.error("Wallet payment error:", err);
      setPaymentError(err.response?.data?.error || "Wallet payment failed.");
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  // --- (NEW) STEP 3: HANDLE STRIPE PAYMENT ---
  const handleStripePayment = async () => {
    if (!selectedEvent) return;

    setLoading(true);
    setPaymentError("");

    try {
      // Call your backend to create a checkout session
      const res = await API.post("/payment/create-stripe-checkout", {
        eventId: selectedEvent.event._id
      });

      // Backend sends back a URL, redirect the user to Stripe
      if (res.data.url) {
        window.location.href = res.data.url;
      }

    } catch (err) {
      console.error("Stripe payment error:", err);
      setPaymentError(err.response?.data?.error || "Could not connect to Stripe.");
      setLoading(false);
    }
    // No 'finally' here, as the page will redirect on success
  };

  // --- REFUND FUNCTION ---
  // --- (MODIFIED) REFUND/CANCEL FUNCTION ---
  const handleRefund = async (registration) => {
    // 1. Get event details from the registration object
    const eventId = registration.event._id;
    const eventStartDate = new Date(registration.event.startDate);

    // 2. The 2-Week Business Rule (Client-side check)
    const today = new Date();
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000; // 14 days

    if (eventStartDate.getTime() - today.getTime() < twoWeeksInMs) {
      alert("Cancellation failed: You can only cancel events that are more than 2 weeks away.");
      return;
    }

    // 3. Confirmation
    if (!window.confirm("Are you sure you want to cancel this event? This action cannot be undone.")) {
      return;
    }

    // 4. API Call
    setLoading(true);
    try {
      // The endpoint is the same, but the logic on the server is new
      await API.post("/payment/request-refund", { eventId });
      
      // Refresh the list. The event will be gone.
      await fetchEvents(); 
    } catch (err) {
      console.error("Refund error:", err);
      // Display the error from the server (e.g., if the deadline passed just now)
      alert(err.response?.data?.error || "Refund request failed.");
    } finally {
      setLoading(false);
    }
  };


  // --- RENDER LOGIC ---

  if (loading && !isModalOpen) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading...</p>
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
    <>
      {/* --- PAYMENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Complete Your Payment</h2>
            <p className="mb-2">
              You are paying for: <strong>{selectedEvent.event.title}</strong>
            </p>
            <p className="text-lg font-semibold mb-6">
              Amount: ${selectedEvent.priceAtRegistration}
            </p>

            {/* Error message display */}
            {paymentError && (
              <p className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {paymentError}
              </p>
            )}

            <div className="space-y-4">
              <button
                onClick={handleWalletPayment}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Processing..." : "Pay with Wallet"}
              </button>
              <button
                onClick={handleStripePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Redirecting..." : "Pay with Credit/Debit Card"}
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
              className="w-full text-center text-gray-600 mt-6"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- PAGE CONTENT --- */}
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
            {registrations
              .filter((reg) => reg.event) // Only show registrations with valid events
              .map((reg) => (
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
                    <strong>Price:</strong> ${reg.priceAtRegistration}
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
                </div>

                {/* --- CONDITIONAL PAYMENT/REFUND SECTION --- */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  
                  {/* Check if event has passed */}
                  {(() => {
                    const eventEndDate = new Date(reg.event.endDate);
                    const now = new Date();
                    const hasEventPassed = eventEndDate < now;

                    // If event has passed, show disabled button
                    if (hasEventPassed) {
                      return (
                        <>
                          <p className="text-sm font-semibold text-gray-500 mb-2">
                            This event has ended
                          </p>
                          <button
                            disabled
                            className="w-full bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed"
                          >
                            Event Passed
                          </button>
                        </>
                      );
                    }

                    // Case 1: "not paid"
                    if (reg.paymentStatus === "not paid") {
                      return (
                        <>
                          <p className="text-sm font-semibold text-red-600 mb-2">
                            Payment Status: Not Paid
                          </p>
                          <button
                            onClick={() => handlePayment(reg)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                          >
                            Pay Now
                          </button>
                        </>
                      );
                    }

                    // Case 2: "paid"
                    if (reg.paymentStatus === "paid") {
                      return (
                        <>
                          <p className="text-sm font-semibold text-green-600 mb-2">
                            You can cancel you registartion and refund your money
                          </p>
                          <button
                            onClick={() => handleRefund(reg)}
                            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition"
                          >
                            cancel & refund
                          </button>
                        </>
                      );
                    }

                    // Case 3: "refunded"
                    if (reg.paymentStatus === "refunded") {
                      return (
                        <>
                          <p className="text-sm font-semibold text-gray-600 mb-2">
                            You have refunded your money
                          </p>
                          <button
                            onClick={() => handlePayment(reg)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                          >
                            Pay Again
                          </button>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
import { useEffect, useState } from "react";
import API from "../services/api";
import ModernAlert from "./ui/ModernAlert";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [workers, setWorkers] = useState([{ name: "", idPicture: null }]);
  const [submitting, setSubmitting] = useState(false);
  
  // Alert states
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");
  const [confirmMessage, setConfirmMessage] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const token = localStorage.getItem("token");

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
  };

  const handleCancelApplication = async (appToCancel) => {
    showConfirm(
      "Are you sure you want to cancel this application? This action cannot be undone.",
      async () => {
        try {
          await API.delete(
            `/events/${appToCancel.id}/applications/${appToCancel.registrationId}/cancel`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          showAlert("Application cancelled successfully.", "success");

          setApplications((prevApps) => 
            prevApps.filter(
              (app) => app.registrationId !== appToCancel.registrationId
            )
          );

        } catch (err) {
          console.error("Error cancelling application:", err);
          showAlert(err.response?.data?.error || "Failed to cancel application.", "error");
        }
      }
    );
  };

  // ---------------------------- Worker Submission ----------------------------
  const handleAddWorker = () => {
    setWorkers([...workers, { name: "", idPicture: null }]);
  };

  const handleRemoveWorker = (index) => {
    setWorkers(workers.filter((_, i) => i !== index));
  };

  const handleWorkerChange = (index, field, value) => {
    const updated = [...workers];
    updated[index][field] = value;
    setWorkers(updated);
  };

  const handleFileChange = (index, file) => {
    const updated = [...workers];
    updated[index].idPicture = file;
    setWorkers(updated);
  };

  const handleSubmitWorkers = async () => {
    const isValid = workers.every((w) => w.name.trim() && w.idPicture);
    if (!isValid) {
      showAlert("Please fill in all worker names and upload their ID pictures", "error");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      workers.forEach((worker, index) => {
        formData.append(`workers[${index}][name]`, worker.name.trim());
        formData.append("workers", worker.idPicture);
      });

      const response = await API.post(
        `/users/${selectedApp.id}/registrations/${selectedApp.registrationId}/submit-workers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showAlert("Workers submitted successfully!", "success");

      setApplications((prev) =>
        prev.map((a) =>
          a.registrationId === selectedApp.registrationId 
            ? { ...a, workersSubmitted: true } 
            : a
        )
      );

      setShowWorkerModal(false);
      setWorkers([{ name: "", idPicture: null }]);

      // Continue to payment after submission
      initiatePayment({ ...selectedApp, workersSubmitted: true });
    } catch (err) {
      console.error("Error submitting workers:", err);
      showAlert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to submit workers",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------- Payment Logic ----------------------------
  const handlePayment = (application) => {
    if (!application.workersSubmitted) {
      setSelectedApp(application);
      setShowWorkerModal(true);
    } else {
      initiatePayment(application);
    }
  };

  const initiatePayment = async (application) => {
    if (!application.finalPrice || application.finalPrice <= 0) {
      showAlert("Invalid price amount", "error");
      return;
    }

    showConfirm(
      "Would you like to pay using your credit card?",
      async () => {
        try {
          const res = await API.post(
            "/payment/create-bazaar-booth-checkout",
            {
              eventId: application.id,
              registrationId: application.registrationId,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (res.data.url) {
            window.location.href = res.data.url; // Stripe redirect
            return;
          }

          showAlert("Could not create Stripe session", "error");

        } catch (err) {
          console.error("Payment error:", err);
          showAlert(
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Payment failed",
            "error"
          );
        }
      }
    );
  };

  // ---------------------------- Fetch Applications ----------------------------
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await API.get("/events/my-applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const apps = Array.isArray(res.data)
          ? res.data
          : res.data?.applications || res.data?.data || [];
        setApplications(apps);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError(err.response?.data?.error || "Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [token]);

  // ---------------------------- UI ----------------------------
  if (loading) return <p>Loading your applications...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="p-6 bg-white rounded-2xl mt-6">
        {!applications.length ? (
          <div className="p-6 border rounded-2xl text-center">
            <p className="text-gray-600">
              You haven't applied for any bazaars or booths yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map((app, idx) => (
              <div
                key={app.registrationId || idx}
                className="border p-4 rounded-lg flex justify-between items-start"
              >
                {/* --- LEFT SIDE: INFO, STATUS, AND BUTTONS --- */}
                <div>
                  <h3 className="font-semibold text-lg">
                    {app.title || "Untitled Event"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {app.startDate && app.endDate
                      ? `${new Date(app.startDate).toLocaleDateString()} - ${new Date(app.endDate).toLocaleDateString()}`
                      : "Date not available"}
                  </p>
                  <p className="text-gray-700">
                    Location: {app.locationInPlatform || app.location || "N/A"}
                    <br />
                    <span className="text-sm">
                      Booth Size:{" "}
                      <span className="text-teal-800">
                        {app.boothSize || "N/A"}
                      </span>{" "}
                      Price:{" "}
                      <span className="text-teal-800">
                        {app.finalPrice} EGP
                      </span>
                    </span>
                  </p>
                  
                  {app.status === "approved" && (
                    <div className="mt-2">
                      Payment Status:{" "}
                      <span
                        className={`font-semibold ${
                          app.paymentStatus === "paid"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {app.paymentStatus?.toUpperCase() || "UNPAID"}
                      </span>
                      
                      {app.workersSubmitted && (
                        <span className="ml-2 text-xs text-green-600">
                          ✓ Workers info submitted
                        </span>
                      )}

                      {app.paymentStatus !== "paid" && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleCancelApplication(app)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handlePayment(app)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
                          >
                            {app.workersSubmitted ? "Pay Now" : "Workers Info"}
                          </button>
                          {app.paymentDeadline && (
                            <p className="mt-2 text-sm text-red-800">
                              {Math.max(
                                0,
                                Math.ceil((new Date(app.paymentDeadline) - new Date()) / (1000 * 60 * 60 * 24))
                              )}{" "}
                              day{Math.abs(Math.ceil((new Date(app.paymentDeadline) - new Date()) / (1000 * 60 * 60 * 24))) !== 1 ? "s" : ""} left
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* --- RIGHT SIDE: STATUS BADGE ONLY --- */}
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      app.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : app.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {(app.status || "unknown").toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Worker Modal */}
      {showWorkerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Employee Information</h2>
            <p className="text-gray-600 mb-6">
              Please provide the names and ID pictures of all employees who will
              be at the booth.
            </p>

            {workers.map((worker, index) => (
              <div key={index} className="border p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Employee {index + 1}</h3>
                  {workers.length > 1 && (
                    <button
                      onClick={() => handleRemoveWorker(index)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={worker.name}
                      onChange={(e) =>
                        handleWorkerChange(index, "name", e.target.value)
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Enter employee name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ID Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange(index, e.target.files[0])
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />
                    {worker.idPicture && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {worker.idPicture.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {workers.length < 3 && (
              <button
                onClick={handleAddWorker}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-colors mb-4"
              >
                + Add Another Employee
              </button>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWorkerModal(false);
                  setWorkers([{ name: "", idPicture: null }]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitWorkers}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit & Continue to Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regular Alert */}
      <ModernAlert 
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />

      {/* Confirmation Dialog */}
      <ModernAlert 
        message={confirmMessage}
        isConfirm={true}
        onConfirm={confirmAction}
        onClose={() => setConfirmMessage(null)}
      />
    </>
  );
}

export default MyApplications;
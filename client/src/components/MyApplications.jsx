import { useEffect, useState } from "react";
import API from "../services/api";
import ModernAlert from "./ui/ModernAlert";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [workers, setWorkers] = useState([{ name: "", idPicture: null }]);
  const [submitting, setSubmitting] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Alert states
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");
  const [confirmMessage, setConfirmMessage] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const token = localStorage.getItem("token");

  const statusOptions = [
    { value: "all", label: "All Applications", color: "gray" },
    { value: "approved", label: "Approved", color: "green" },
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "rejected", label: "Rejected", color: "red" }
  ];

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
  };

  // Filter applications based on selected status
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter(app => app.status === statusFilter)
      );
    }
  }, [applications, statusFilter]);

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
  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 bg-white rounded-2xl mt-6">
      <div className="text-center text-red-500 p-4 border border-red-200 rounded-lg bg-red-50">
        {error}
      </div>
    </div>
  );

  return (
    <>
      <div className="p-6 bg-white rounded-2xl mt-6">
        {/* Header with Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-1">
              Manage your bazaar and booth applications
            </p>
          </div>
          
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  statusFilter === option.value
                    ? `bg-${option.color}-100 text-${option.color}-700 border-2 border-${option.color}-300`
                    : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                {option.label}
                {option.value !== "all" && (
                  <span className="ml-1 bg-white/50 px-1.5 py-0.5 rounded-full text-xs">
                    {applications.filter(app => app.status === option.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {!filteredApplications.length ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-gray-400 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">
              {applications.length === 0 
                ? "You haven't applied for any bazaars or booths yet."
                : `No ${statusFilter} applications found.`
              }
            </p>
            {applications.length === 0 && (
              <button className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                Browse Bazaars
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app, idx) => (
              <div
                key={app.registrationId || idx}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-white"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  {/* Left Side: Application Details */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3">
                      <h3 className="font-bold text-xl text-gray-900 mb-2 sm:mb-0">
                        {app.title || "Untitled Event"}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            app.status === "approved"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : app.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {(app.status || "unknown").toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Application Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {app.startDate && app.endDate
                              ? `${new Date(app.startDate).toLocaleDateString()} - ${new Date(app.endDate).toLocaleDateString()}`
                              : "Date not available"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{app.locationInPlatform || app.location || "Location not specified"}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          <span>Booth Size: <strong className="text-teal-700">{app.boothSize || "N/A"}</strong></span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span>Price: <strong className="text-teal-700">{app.finalPrice} EGP</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Status-specific actions */}
                    {app.status === "approved" && (
                      <div className="border-t pt-4 mt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-2 sm:space-y-0">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">
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
                              </span>
                              
                              {app.workersSubmitted && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Workers info submitted
                                </span>
                              )}
                            </div>
                            
                            {app.paymentDeadline && app.paymentStatus !== "paid" && (
                              <div className="flex items-center text-sm text-red-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {Math.max(
                                  0,
                                  Math.ceil((new Date(app.paymentDeadline) - new Date()) / (1000 * 60 * 60 * 24))
                                )}{" "}
                                day{Math.abs(Math.ceil((new Date(app.paymentDeadline) - new Date()) / (1000 * 60 * 60 * 24))) !== 1 ? "s" : ""} left to pay
                              </div>
                            )}
                          </div>

                          {app.paymentStatus !== "paid" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCancelApplication(app)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                              </button>
                              <button
                                onClick={() => handlePayment(app)}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors flex items-center"
                              >
                                {app.workersSubmitted ? (
                                  <>
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    Pay Now
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Workers Info
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Worker Modal */}
      {showWorkerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Add Employee Information</h2>
            <p className="text-gray-600 mb-6">
              Please provide the names and ID pictures of all employees who will
              be at the booth.
            </p>

            {workers.map((worker, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900">Employee {index + 1}</h3>
                  {workers.length > 1 && (
                    <button
                      onClick={() => handleRemoveWorker(index)}
                      className="text-red-500 text-sm hover:text-red-700 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={worker.name}
                      onChange={(e) =>
                        handleWorkerChange(index, "name", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter employee name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      ID Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange(index, e.target.files[0])
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    {worker.idPicture && (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {worker.idPicture.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {workers.length < 3 && (
              <button
                onClick={handleAddWorker}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-colors mb-4 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Another Employee
              </button>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWorkerModal(false);
                  setWorkers([{ name: "", idPicture: null }]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitWorkers}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit & Continue to Payment"
                )}
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
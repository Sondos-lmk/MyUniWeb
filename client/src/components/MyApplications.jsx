import { useEffect, useState } from "react";
import API from "../services/api";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [workers, setWorkers] = useState([{ name: "", idPicture: null }]);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const handleAddWorker = () => {
    setWorkers([...workers, { name: "", idPicture: null }]);
  };

  const handleRemoveWorker = (index) => {
    setWorkers(workers.filter((_, i) => i !== index));
  };

  const handleWorkerChange = (index, field, value) => {
    const updatedWorkers = [...workers];
    updatedWorkers[index][field] = value;
    setWorkers(updatedWorkers);
  };

  const handleFileChange = (index, file) => {
    const updatedWorkers = [...workers];
    updatedWorkers[index].idPicture = file;
    setWorkers(updatedWorkers);
  };

  const handleSubmitWorkers = async () => {
  const isValid = workers.every(w => w.name.trim() && w.idPicture);
  if (!isValid) {
    alert("Please fill in all worker names and upload their ID pictures");
    return;
  }

  setSubmitting(true);
  try {
    const formData = new FormData();
    
    workers.forEach((worker, index) => {
      formData.append(`workers[${index}][name]`, worker.name.trim());
      formData.append(`workers`, worker.idPicture);
    });

    console.log('Submitting workers for application:', selectedApp);

    const response = await API.post(
      `/users/vendor/${selectedApp.id}/submit-workers`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log('Workers submission response:', response.data);
    alert("Workers information submitted successfully!");
    
    // Method 1: Update state optimistically with the selected app data
    setApplications(prevApps => 
      prevApps.map(app => {
        // Try multiple ID fields since structure might vary
        const matches = app.id === selectedApp.id || 
                       app._id === selectedApp.id || 
                       app._id === selectedApp._id;
        
        if (matches) {
          console.log('Updating app in state:', app.id || app._id);
          return { 
            ...app, 
            workersSubmitted: true 
          };
        }
        return app;
      })
    );

    setShowWorkerModal(false);
    setWorkers([{ name: "", idPicture: null }]);

    // Method 2: Force a complete refresh and use the updated data
    setTimeout(async () => {
      try {
        const res = await API.get("/events/my-applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const apps = Array.isArray(res.data)
          ? res.data
          : res.data?.applications || res.data?.data || [];
        
        console.log('Refreshed applications after worker submission:', apps);
        setApplications(apps);

        // Find the updated application
        const updatedApp = apps.find(app => 
          app.id === selectedApp.id || app._id === selectedApp.id
        );
        
        if (updatedApp) {
          console.log('Found updated app for payment:', updatedApp);
          handlePayment(updatedApp);
        } else {
          console.log('Updated app not found, using optimistic update');
          handlePayment({ ...selectedApp, workersSubmitted: true });
        }
      } catch (error) {
        console.error('Error refreshing applications:', error);
        // Fallback to optimistic update
        handlePayment({ ...selectedApp, workersSubmitted: true });
      }
    }, 500);

  } catch (err) {
    console.error("Error submitting workers:", err);
    alert(err.response?.data?.message || err.response?.data?.error || "Failed to submit workers information");
  } finally {
    setSubmitting(false);
  }
};

  const handlePayment = (application) => {
  console.log('handlePayment called with application:', {
    id: application.id,
    _id: application._id,
    title: application.title,
    workersSubmitted: application.workersSubmitted,
    paymentStatus: application.paymentStatus,
    status: application.status
  });
  
  if (!application.workersSubmitted) {
    console.log('Opening worker modal because workersSubmitted is false');
    setSelectedApp(application);
    setShowWorkerModal(true);
  } else {
    console.log('Proceeding to payment because workersSubmitted is true');
    initiatePayment(application);
  }
};

  const initiatePayment = (application) => {
    // Implement your payment logic here
    console.log("Initiating payment process for:", application);
    
    // Example: Open a payment modal or redirect to payment page
    alert(`Redirecting to payment for ${application.title}\nAmount: ${application.finalPrice} EGP`);
    
    // You can replace this with actual payment integration like:
    // - Stripe checkout
    // - PayPal
    // - Custom payment modal
    // - Redirect to payment page
  };

 useEffect(() => {
  const fetchApplications = async () => {
    try {
      const res = await API.get("/events/my-applications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched applications response:", res.data);
      
      const apps = Array.isArray(res.data)
        ? res.data
        : res.data?.applications || res.data?.data || [];

      // Debug: Check if workersSubmitted exists in the response
      console.log("Applications with workersSubmitted check:");
      apps.forEach((app, index) => {
        console.log(`App ${index}:`, {
          id: app.id,
          title: app.title,
          hasWorkersSubmitted: 'workersSubmitted' in app,
          workersSubmitted: app.workersSubmitted,
          status: app.status,
          paymentStatus: app.paymentStatus
        });
      });

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

  if (loading) return <p>Loading your applications...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="p-6 bg-white shadow-md rounded-2xl mt-6">
        <h2 className="text-xl font-bold mb-4">My Applications</h2>
        
        {!applications || applications.length === 0 ? (
          <div className="p-6 bg-white border shadow-md rounded-2xl text-center">
            <p className="text-gray-600">You haven't applied for any bazaars or booths yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map((app, idx) => (
              <div
                key={idx}
                className="border p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-lg">{app.title || "Untitled Event"}</h3>
                  {app.startDate && app.endDate ? (
                    <p className="text-sm text-gray-600 mb-1">
                      {new Date(app.startDate).toLocaleDateString()} -{" "}
                      {new Date(app.endDate).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mb-1">Date not available</p>
                  )}
                  <p className="text-gray-700">
                    Location: {app.location || app.locationInPlatform || "N/A"}
                    <br />
                    <span className="text-left text-sm">
                      Booth Size: <span className="text-teal-800">{app.boothSize || "N/A"}</span>
                      &nbsp; Price: <span className="text-teal-800">{app.finalPrice} EGP</span>
                    </span>
                  </p>
                  {app.status === "approved" && app.paymentStatus && (
                    <>
                      <br />
                      Payment Status:{" "}
                      <span
                        className={`font-semibold ${
                          app.paymentStatus === "paid" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {app.paymentStatus.toUpperCase()}
                      </span>
                      <br />
                      {app.workersSubmitted && (
                        <span className="ml-2 text-xs text-green-600">
                          ✓ Workers info submitted
                        </span>
                      )}
                    </>
                  )}
                </div>

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
                  {app.status === "approved" && app.paymentStatus === "unpaid" && (
                    <div className="mt-18">
                      <button
                        onClick={() => handlePayment(app)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
                      >
                        {app.workersSubmitted ? "Pay Now" : "Workers Info"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Worker Information Modal */}
      {showWorkerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Employee Information</h2>
            <p className="text-gray-600 mb-6">
              Please provide the names and ID pictures of all employees who will be at the booth.
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
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={worker.name}
                      onChange={(e) => handleWorkerChange(index, "name", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Enter employee name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">ID Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(index, e.target.files[0])}
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
    </>
  );
}

export default MyApplications;
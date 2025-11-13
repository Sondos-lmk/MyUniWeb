import { useEffect, useState } from "react";
import { useNavigate} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ApplyBoothForm from "../components/ApplyBoothForm";
import MyApplications from "../components/MyApplications";
import API from "../services/api";
import LoyaltyManager from "../components/LoyalityProgrameManger"

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || "unknown";

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reps, setReps] = useState([{ name: "", email: "" }]);
  const [boothSize, setBoothSize] = useState("2x2");
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [showLogoUpload, setShowLogoUpload] = useState(false); // NEW: for logo upload modal
  const [logoUploading, setLogoUploading] = useState(false); // NEW: for upload loading state

  const token = localStorage.getItem("token");

  // Fetch vendor profile including logo
  useEffect(() => {
    if (role === 'vendor') {
      fetchVendorProfile();
    }
  }, [role]);

  const fetchVendorProfile = async () => {
    try {
      const res = await API.get('/users/vendor/profile');
      console.log('🖼️ Logo path:', res.data.vendor?.logo);
      setVendorData(res.data.vendor);
    } catch (error) {
      console.error('Failed to fetch vendor profile:', error);
    } finally {
      setVendorLoading(false);
    }
  };

  // NEW: Handle logo upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (e.g., 5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      return;
    }

    setLogoUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('companyName', vendorData?.companyName || '');

      const response = await API.put('/users/vendor/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Logo upload response:', response.data);
      
      // Update vendor data with new logo
      setVendorData(prev => ({
        ...prev,
        logo: response.data.vendor.logo
      }));
      
      setShowLogoUpload(false);
      
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setLogoUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Rest of your existing code (events fetching, handlers, etc.)...
  // 1) Vendor: fetch upcoming bazaar events
  useEffect(() => {
    if (role !== "vendor") {
      setEvents([]);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await API.get("/events?type=bazaar", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const eventsArray = Array.isArray(res.data.events) ? res.data.events : [];
        const now = new Date();
        const upcomingBazaars = eventsArray.filter(
          (event) => new Date(event.startDate) > now
        );

        setEvents(upcomingBazaars);
      } catch (err) {
        console.error("Error fetching vendor events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [role, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setReps([{ name: "", email: "" }]);
    setBoothSize("2x2");
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      const res = await API.post(
        `/events/bazaar/${selectedEvent._id}/register`,
        { reps, boothSize },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || "Applied successfully!");
      setSelectedEvent(null);
      setReps([{ name: "", email: "" }]);
      setBoothSize("2x2");
    } catch (err) {
      console.error("Error applying for bazaar:", err);
      alert(err.response?.data?.error || "Failed to apply");
    }
  };

  const calculateEstimatedPrice = (event, boothSize) => {
    if (!event.startDate || !event.endDate) return { days: 0, price: 0 };

    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { days: 0, price: 0 };

    const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.floor((endUTC - startUTC) / msPerDay) + 1;

    const sizeMultiplier = boothSize === "4x4" ? 1.5 : 1;
    const basePrice = event.basePricePerDay || 1000;

    const price = days * basePrice * sizeMultiplier;

    return { days, price };
  };

  const name = (() => {
    if (!user) return "Loading...";
    if (user.role === "vendor") return user?.companyName || "Vendor";
    return user.name || "User";
  })();

  return (
    <div className="p-10 relative">
      {/* Header with Logo */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* Vendor Logo Display */}
          {role === "vendor" && (
            <div className="flex items-center gap-4">
              <div className="relative group"> {/* NEW: Added relative positioning and group */}
                {vendorLoading ? (
                  <div className="w-30 h-30 rounded-full border-2 border-teal-600 bg-gray-200 animate-pulse"></div>
                ) : vendorData?.logo ? (
                  <div className="w-30 h-30 rounded-full border-2 border-teal-600 overflow-hidden bg-white shadow-md">
                    <img 
                      src={`http://localhost:4000${vendorData.logo}`}
                      alt={`${vendorData.companyName || 'Vendor'} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    {/* Fallback that shows if image fails to load */}
                    <div 
                      className="w-full h-full bg-teal-100 hidden items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <span className="text-teal-800 font-bold text-lg">
                        {(vendorData.companyName || 'V').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : (
                  // Fallback when no logo exists
                  <div className="w-16 h-16 rounded-full border-2 border-teal-600 bg-teal-100 flex items-center justify-center shadow-md">
                    <span className="text-teal-800 font-bold text-lg">
                      {(vendorData?.companyName || name || 'V').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* NEW: Edit icon overlay */}
                <button
                  onClick={() => setShowLogoUpload(true)}
                  className="absolute bottom-0 right-0 bg-teal-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-teal-700"
                  title="Change logo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="text-left">
                <h1 className="text-2xl font-bold">
                 Welcome to your dashboard!
                </h1>
                <p className="text-gray-600 font-medium text-lg mt-1">
                  {name ? name.charAt(0).toUpperCase() + name.slice(1) : "User"}
                </p>
                {vendorData?.isVerified && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block mt-1">
                    Verified Vendor ✓
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Show regular header for non-vendors */}
          {role !== "vendor" && (
            <h1 className="text-2xl font-bold">
              Welcome to your dashboard!{" "}
              {name ? name.charAt(0).toUpperCase() + name.slice(1) : "User"} ({role})
            </h1>
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
        >
          Logout
        </button>
      </div>

      {/* NEW: Logo Upload Modal */}
      {showLogoUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Update Company Logo</h2>
            <p className="text-gray-600 mb-6">
              Upload a new logo for your company. Supported formats: JPG, PNG, GIF. Max size: 5MB.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={logoUploading}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer block"
              >
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600">
                  {logoUploading ? 'Uploading...' : 'Click to select an image'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG, GIF • Max 5MB
                </p>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoUpload(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={logoUploading}
              >
                Cancel
              </button>
              <button
                onClick={() => document.getElementById('logo-upload').click()}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400"
                disabled={logoUploading}
              >
                {logoUploading ? 'Uploading...' : 'Select Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of your existing vendor dashboard code... */}
      {/* Vendor Dashboard */}
      {role === "vendor" && (
        <div className="flex justify-between items-start gap-6 p-6">
          {/* LEFT — Upcoming Bazaars */}
          <div className="w-1/2">
            <div className="p-6 bg-white shadow-md rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Upcoming Bazaar Events</h2>

              {loading ? (
                <p>Loading bazaars...</p>
              ) : !events?.length ? (
                <p>No upcoming bazaars yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {events.map((event) => (
                    <div
                      key={event._id}
                      className="border p-4 rounded-lg shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-bold text-lg">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {new Date(event.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          -{" "}
                          {new Date(event.endDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-gray-700">{event.desc}</p>
                      </div>
                      <button
                        onClick={() => handleSelectEvent(event)}
                        className="bg-teal-600 text-white px-4 py-1 rounded hover:bg-teal-700 self-start"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <MyApplications />
            <div className="mt-6">
              <LoyaltyManager />
            </div>
          </div>

          {/* RIGHT — Booth Application Form */}
          <div className="w-1/2">
            <div className="p-6 bg-white shadow-md rounded-2xl">
              <ApplyBoothForm />
            </div>
          </div>
        </div>
      )}

      {/* Modal for applying to bazaar */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white p-6 rounded-lg w-96 relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">
              Apply for: {selectedEvent.title}
            </h2>
            {/* Estimated Price */}
            <p className="mb-2 font-semibold">
              Number of Days: {calculateEstimatedPrice(selectedEvent, boothSize).days}
              <br />
              Estimated Price:{" "}
              <span className="text-teal-600">
                {calculateEstimatedPrice(selectedEvent, boothSize).price.toFixed(2)} EGP
              </span>
            </p>

            <form onSubmit={handleSubmit}>
              <label className="block mb-2 font-medium">Booth Size</label>
              <select
                className="border rounded p-2 w-full mb-4"
                value={boothSize}
                onChange={(e) => setBoothSize(e.target.value)}
                required
              >
                <option value="2x2">2x2</option>
                <option value="4x4">4x4</option>
              </select>

              {reps.map((rep, idx) => (
                <div key={idx} className="mb-3 flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Name"
                      className="border rounded p-2 w-full mb-1"
                      value={rep.name}
                      onChange={(e) => {
                        const newReps = [...reps];
                        newReps[idx].name = e.target.value;
                        setReps(newReps);
                      }}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="border rounded p-2 w-full"
                      value={rep.email}
                      onChange={(e) => {
                        const newReps = [...reps];
                        newReps[idx].email = e.target.value;
                        setReps(newReps);
                      }}
                      required
                    />
                  </div>
                  {reps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newReps = reps.filter((_, i) => i !== idx);
                        setReps(newReps);
                      }}
                      className="text-red-600 font-bold px-2 py-1 rounded hover:bg-red-100"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {reps.length < 5 && (
                <button
                  type="button"
                  onClick={() => setReps([...reps, { name: "", email: "" }])}
                  className="text-teal-600 underline mb-4"
                >
                  Add Another Representative
                </button>
              )}

              <button
                type="submit"
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
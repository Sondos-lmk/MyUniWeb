import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Store, MapPin, Calendar, Package, Tag, Clock, ExternalLink } from "lucide-react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function AvailableBooths({ showActions = false }) {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };



  useEffect(() => {
    fetchPlatformBooths();
  }, []);

  const fetchPlatformBooths = async () => {
    try {
      setLoading(true);
      
      // Fetch both booths and bazaars separately since getAllEvents excludes booths by default
      const [boothsRes, bazaarsRes] = await Promise.all([
        API.get("/events/?type=booth"),
        API.get("/events/?type=bazaar")
      ]);
      
      const booths = Array.isArray(boothsRes.data) ? boothsRes.data : boothsRes.data?.events || [];
      const bazaars = Array.isArray(bazaarsRes.data) ? bazaarsRes.data : bazaarsRes.data?.events || [];
      const allEvents = [...booths, ...bazaars];
      
      // Filter for booth and bazaar events and extract active vendor registrations
      const boothData = [];
      const now = new Date();
      
      allEvents.forEach(event => {
        // Include both 'booth' (platform booths) and 'bazaar' (bazaar booths)
        if ((event.type === 'booth' || event.type === 'bazaar') && event.status === 'approved') {
          if (event.registeredVendors && event.registeredVendors.length > 0) {
            // For each approved and paid vendor
            event.registeredVendors.forEach((vendorReg) => {
              if (vendorReg.status === 'approved' && vendorReg.paymentStatus === 'paid') {
                // For platform booths, check if still active
                // For bazaar booths, check if event hasn't ended yet
                const endDate = new Date(event.type === 'booth' ? vendorReg.endDate : event.endDate);
                
                if (endDate >= now) {
                  boothData.push({
                    _id: vendorReg._id || `${event._id}-${vendorReg.vendor}`,
                    boothTitle: event.title,
                    locationInPlatform: event.locationInPlatform || event.location,
                    boothSize: vendorReg.boothSize,
                    startDate: event.type === 'booth' ? vendorReg.startDate : event.startDate,
                    endDate: event.type === 'booth' ? vendorReg.endDate : event.endDate,
                    vendorId: vendorReg.vendor,
                    finalPrice: vendorReg.finalPrice,
                    status: 'published',
                    isPaid: true,
                    boothEventId: event._id,
                    eventType: event.type // 'booth' or 'bazaar'
                  });
                }
              }
            });
          }
        }
      });
      
      setBooths(boothData);
    } catch (err) {
      console.error("Error fetching booths:", err);
      setBooths([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingDays = (endDate) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return "—";
    const start = new Date(startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    if (!endDate) return start;
    const end = new Date(endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    return `${start} – ${end}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Booths</h1>
        <p className="text-slate-600">Browse active booths on our platform</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading booths...</p>
        </div>
      ) : booths.length === 0 ? (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No active booths on platform</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {booths.map((booth) => {
            const vendor = booth.vendorId || {};
            const remainingDays = calculateRemainingDays(booth.endDate);
            const isExpiringSoon = remainingDays !== null && remainingDays <= 7 && remainingDays > 0;
            
            // Check if booth has started
            const now = new Date();
            const startDate = new Date(booth.startDate);
            const hasStarted = startDate <= now;
            const hasBadge = hasStarted && remainingDays > 0;
            
            // Get vendor logo URL
            const vendorLogo = vendor.logo ? `http://localhost:4000${vendor.logo}` : null;

            return (
              <div
                key={booth._id}
                className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Booth Header with Logo */}
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white relative">
                  {/* Booth Type Badge - Top Left */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">
                    {booth.eventType === 'bazaar' ? 'Bazaar' : 'Platform'}
                  </div>
                  {/* 3 Dots Menu (Event Officer Only) */}
                  {showActions && (
                    <div
                      className={`absolute top-3 z-55 
                        ${hasBadge ? "right-25" : "right-3"}`}
                    >
                      <div className="relative">
                        <button
                          onClick={() => toggleMenu(booth._id)}
                          className="p-1.5 rounded-full hover:bg-white/20 transition"
                        >
                          <MoreVertical className="w-5 h-5 text-white" />
                        </button>

                        {/* Dropdown */}
                        {openMenuId === booth._id && (
                          <div className="absolute mt-2 right-0 bg-white shadow-xl border border-slate-200 rounded-lg w-44 overflow-hidden z-50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();   // prevents parent click from firing
                              navigate(`/eventOfficer/events/${booth.boothEventId}/details`, {
                                state: { openQR: true, fromBoothsPage: true },
                              });
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            QR Codes
                          </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Remaining Days Badge - Top Right (only if started) */}
                  {hasStarted && remainingDays !== null && remainingDays > 0 && (
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                      isExpiringSoon ? "bg-amber-500" : "bg-white/20 backdrop-blur-sm"
                    }`}>
                      {remainingDays} day{remainingDays !== 1 ? "s" : ""} left
                    </div>
                  )}
                  
                  {/* Vendor Logo */}
                  {vendorLogo ? (
                    <div className="w-16 h-16 bg-white rounded-lg mb-3 flex items-center justify-center overflow-hidden mt-8">
                      <img src={vendorLogo} alt={vendor.companyName || vendor.businessName} className="w-full h-full object-contain p-1" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg mb-3 flex items-center justify-center mt-8">
                      <Store className="w-8 h-8 text-white" />
                    </div>
                  )}
                  
                  {/* Booth Title */}
                  <h3 className="text-xl font-bold mb-1">
                    {booth.boothTitle}
                  </h3>
                  
                  {/* Vendor Name */}
                  {(vendor.companyName || vendor.businessName) && (
                    <p className="text-sm text-cyan-50">by {vendor.companyName || vendor.businessName}</p>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  {/* Duration */}
                  <div className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Duration</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {formatDateRange(booth.startDate, booth.endDate)}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  {booth.locationInPlatform && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Location on Platform</div>
                        <div className="text-sm font-semibold text-slate-900">
                          {booth.locationInPlatform}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booth Size */}
                  {booth.boothSize && (
                    <div className="flex items-start gap-2">
                      <Package className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Booth Size</div>
                        <div className="text-sm font-semibold text-slate-900">{booth.boothSize}</div>
                      </div>
                    </div>
                  )}

                  {/* Products Preview */}
                  {vendor.productsOffered && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 font-medium mb-1">Products Offered</div>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {vendor.productsOffered}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

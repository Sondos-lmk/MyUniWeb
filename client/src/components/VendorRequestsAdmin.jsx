import { useEffect, useState } from "react";
import API from "../services/api";

export default function VendorRequestsAdmin() {
  const [events, setEvents] = useState([]);
  const [vendorsMap, setVendorsMap] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [bazaarsRes, boothsRes] = await Promise.all([
          API.get("/events", { params: { type: "bazaar" } }),
          API.get("/events", { params: { type: "booth" } }),
        ]);

        const bazaars = Array.isArray(bazaarsRes.data?.events)
          ? bazaarsRes.data.events
          : Array.isArray(bazaarsRes.data)
          ? bazaarsRes.data
          : [];

        const booths = Array.isArray(boothsRes.data?.events)
          ? boothsRes.data.events
          : Array.isArray(boothsRes.data)
          ? boothsRes.data
          : [];

        const now = new Date();

        const approvedBazaars = bazaars.filter(
          (e) => e.status === "approved" && new Date(e.startDate) > now
        );
        const approvedBooths = booths.filter((e) => e.status === "approved");

        const approvedEvents = [...approvedBazaars, ...approvedBooths];
        setEvents(approvedEvents);

        // Extract vendor IDs - handle both populated objects and ID strings
        const vendorIds = approvedEvents
          .flatMap((ev) => ev.registeredVendors.map((v) => {
            // If vendor is already populated (object), use its _id
            if (typeof v.vendor === 'object' && v.vendor !== null) {
              return v.vendor._id;
            }
            // Otherwise it's just an ID string
            return v.vendor;
          }))
          .filter(Boolean);

        const uniqueVendorIds = [...new Set(vendorIds)];

        if (uniqueVendorIds.length > 0) {
          // Check if vendors are already populated
          const firstVendor = approvedEvents[0]?.registeredVendors?.[0]?.vendor;
          const isAlreadyPopulated = typeof firstVendor === 'object' && firstVendor !== null;
          
          if (isAlreadyPopulated) {
            // Vendors already populated, just create the map
            const map = {};
            approvedEvents.forEach((ev) => {
              ev.registeredVendors.forEach((v) => {
                if (typeof v.vendor === 'object' && v.vendor !== null) {
                  map[v.vendor._id] = v.vendor.companyName || v.vendor.businessName || v.vendor.name;
                }
              });
            });
            setVendorsMap(map);
          } else {
            // Need to fetch vendor data
            const vendorsData = await Promise.all(
              uniqueVendorIds.map((id) =>
                API.get(`/users/${id}`).catch(() => null)
              )
            );

            const map = {};
            vendorsData.forEach((res) => {
              if (res && res.data) {
                map[res.data._id] = res.data.companyName || res.data.name;
              }
            });

            setVendorsMap(map);
          }
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  const handleVendorStatus = async (eventId, registrationId, newStatus) => {
  try {
    const response = await API.patch(
      `/events/${eventId}/vendors/${registrationId}`,
      { status: newStatus }
    );

    setEvents((prev) =>
      prev.map((ev) => {
        if (ev._id !== eventId) return ev;

        return {
          ...ev,
          registeredVendors: ev.registeredVendors.map((v) => {
            // Compare registration _id (not vendor user ID)
            return v._id === registrationId 
              ? { ...v, status: newStatus } 
              : v;
          }),
        };
      })
    );

    alert(`Vendor ${newStatus} successfully!`);
  } catch (err) {
    console.error("Error updating vendor status:", err);
    alert(
      err.response?.data?.error || "Failed to update vendor status."
    );
  }
};


  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Approve Vendor Requests</h2>

      {events.length === 0 ? (
        <div>
        </div>
      ) : (
        events.map((event) => {
          const pendingVendors =
            event.registeredVendors?.filter((v) => v.status === "pending") || [];

          return (
            <div
              key={event._id}
              className="mb-6 p-6 bg-white rounded-xl shadow border-2 border-blue-200"
            >
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-xl font-semibold">
                  {event.title} ({event.type})
                </h2>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {event.status}
                </span>
              </div>

              {event.type === "bazaar" && event.startDate && event.endDate && (
                <p className="text-gray-600 mb-2">
                  📅 {new Date(event.startDate).toLocaleDateString()} -{" "}
                  {new Date(event.endDate).toLocaleDateString()}
                </p>
              )}

              <p className="text-gray-600 mb-4">
                📍 {event.location || event.locationInPlatform || "No location specified"}
              </p>

              <div className="mb-2 text-sm text-gray-500">
                Total Vendors: {event.registeredVendors?.length || 0} | Pending:{" "}
                {pendingVendors.length} | Approved:{" "}
                {event.registeredVendors?.filter((v) => v.status === "approved")
                  .length || 0}
              </div>

              <h3 className="text-lg font-semibold mb-2">Pending Vendors</h3>

              {pendingVendors.length === 0 ? (
                <p className="text-gray-500 italic">
                  No pending vendors for this event.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="border p-2">Vendor</th>
                        <th className="border p-2">Representatives</th>
                        <th className="border p-2">Booth Size</th>
                        <th className="border p-2">Start Date</th>
                        <th className="border p-2">End Date</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingVendors.map((vendor, idx) => {
                        // Get vendor ID - handle both populated object and string
                        const vendorId = typeof vendor.vendor === 'object' && vendor.vendor !== null 
                          ? vendor.vendor._id 
                          : vendor.vendor;
                        
                        // Get vendor name - check if populated first
                        const vendorName = typeof vendor.vendor === 'object' && vendor.vendor !== null
                          ? (vendor.vendor.companyName || vendor.vendor.businessName || vendor.vendor.name)
                          : (vendorsMap[vendorId] || vendorId || "Unknown");
                        
                        return (
                        <tr key={vendorId || idx} className="hover:bg-gray-50">
                          <td className="border p-2">
                            {capitalize(vendorName)}
                          </td>
                          <td className="border p-2">
                            {vendor.reps?.map((r, i) => (
                              <div key={i} className="text-sm">
                                {r.name} ({r.email})
                              </div>
                            )) || "—"}
                          </td>
                          <td className="border p-2">{vendor.boothSize || "—"}</td>
                          <td className="border p-2">
                            {vendor.startDate
                              ? new Date(vendor.startDate).toLocaleDateString()
                              : event.startDate
                              ? new Date(event.startDate).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="border p-2">
                            {vendor.endDate
                              ? new Date(vendor.endDate).toLocaleDateString()
                              : event.endDate
                              ? new Date(event.endDate).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="border p-2">
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {vendor.status}
                            </span>
                          </td>
                          <td className="border p-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleVendorStatus(
                                    event._id,
                                    vendor._id,
                                    "approved"
                                  )
                                }
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-900"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleVendorStatus(
                                    event._id,
                                    vendor._id,
                                    "rejected"
                                  )
                                }
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-900"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

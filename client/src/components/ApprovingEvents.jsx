import { useEffect, useState } from "react";
import API from "../services/api";

export default function ApprovedEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [bazaarsRes, boothsRes] = await Promise.all([
          API.get("/events", { params: { type: "bazaar" } }),
          API.get("/events", { params: { type: "booth" } }),
        ]);

        // Ensure data arrays
        const bazaars = Array.isArray(bazaarsRes.data) ? bazaarsRes.data : [];
        const booths = Array.isArray(boothsRes.data) ? boothsRes.data : [];

        // Filter approved events
        const approvedEvents = [
          ...bazaars.filter((e) => e.status === "approved"),
          ...booths.filter((e) => e.status === "approved"),
        ];

        setEvents(approvedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  const handleVendorStatus = async (eventId, vendorId, newStatus) => {
    try {
      await API.patch(`/events/${eventId}/vendors/${vendorId}`, { status: newStatus });

      // Update local state
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId
            ? {
                ...ev,
                registeredVendors: ev.registeredVendors.map((v) =>
                  v.vendor === vendorId ? { ...v, status: newStatus } : v
                ),
              }
            : ev
        )
      );
    } catch (err) {
      console.error("Error updating vendor status:", err);
      alert("Booth is reserved by another vendor for the selected dates.");
    }
  };

  return (
    <div>
      {events.length === 0 ? (
        <p>No approved events found.</p>
      ) : (
        events.map((event) => (
          <div key={event._id} className="mb-6 p-6 bg-white rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-1">
              {event.title} ({event.type})
            </h2>

            {event.type === "bazaar" && event.startDate && event.endDate && (
              <p className="text-gray-600 mb-2">
                {new Date(event.startDate).toLocaleDateString()} -{" "}
                {new Date(event.endDate).toLocaleDateString()}
              </p>
            )}

            <p className="text-gray-600 mb-4">{event.location || "No location specified"}</p>

            <h3 className="text-lg font-semibold mb-2">Pending Vendors</h3>
            {event.registeredVendors?.filter((v) => v.status === "pending").length === 0 ? (
              <p className="text-gray-500">No pending vendors.</p>
            ) : (
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="border p-2">Vendor</th>
                    <th className="border p-2">Reps</th>
                    <th className="border p-2">Booth Size</th>
                    <th className="border p-2">Start Date</th>
                    <th className="border p-2">End Date</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {event.registeredVendors
                    .filter((v) => v.status === "pending")
                    .map((vendor) => (
                      <tr key={vendor.vendor}>
                        <td className="border p-2">{vendor.vendorName || vendor.vendor}</td>
                        <td className="border p-2">
                          {vendor.reps?.map((r, i) => (
                            <div key={i}>
                              {r.name} ({r.email})
                            </div>
                          ))}
                        </td>
                        <td className="border p-2">{vendor.boothSize || "—"}</td>
                        <td className="border p-2">
                          {vendor.startDate ? new Date(vendor.startDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="border p-2">
                          {vendor.endDate ? new Date(vendor.endDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="border p-2">
                          <button
                            onClick={() => handleVendorStatus(event._id, vendor.vendor, "approved")}
                            className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVendorStatus(event._id, vendor.vendor, "rejected")}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
}

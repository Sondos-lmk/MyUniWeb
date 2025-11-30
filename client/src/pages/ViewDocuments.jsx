import { useEffect, useState } from "react";
import API from "../services/api";
import VendorDocumentsModal from "../components/VendorDocumentModal.jsx";
import { useNavigate } from "react-router-dom";


export default function ViewDocuments() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [vendorsMap, setVendorsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({ eventId: null, vendorId: null });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch all booths + bazaars with registered vendors
        const [bazaarsRes, boothsRes] = await Promise.all([
          API.get("/events", { params: { type: "bazaar" } }),
          API.get("/events", { params: { type: "booth" } }),
        ]);

        const bazaars = bazaarsRes.data?.events || [];
        const booths = boothsRes.data?.events || [];

        const combined = [...bazaars, ...booths];
        setEvents(combined);

        // Create vendorId → companyName map
        const vendorIds = combined.flatMap(ev =>
          ev.registeredVendors
            .map(v => {
              // Handle both populated objects and ID strings
              return typeof v.vendor === 'object' && v.vendor !== null ? v.vendor._id : v.vendor;
            })
            .filter(id => id !== null && id !== undefined && id !== 'null') // Filter out null/undefined values
        );

        const unique = [...new Set(vendorIds)];

        if (unique.length > 0) {
          const data = await Promise.all(
            unique.map(id => API.get(`/users/${id}`).catch(() => null))
          );

          const map = {};
          data.forEach(response => {
            if (response?.data) {
              map[response.data._id] =
                response.data.companyName || response.data.name;
            }
          });

          setVendorsMap(map);
        }
      } catch (err) {
        console.error("Failed to load docs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading documents…</p>;

  // Flatten all vendors from all events into a single list
  const allVendors = events.flatMap(event =>
    event.registeredVendors
      .filter(v => {
        const vendorId = typeof v.vendor === 'object' && v.vendor !== null ? v.vendor._id : v.vendor;
        return vendorId && vendorId !== 'null';
      })
      .map(v => {
        const vendorId = typeof v.vendor === 'object' && v.vendor !== null ? v.vendor._id : v.vendor;
        const vendorName = typeof v.vendor === 'object' && v.vendor !== null 
          ? (v.vendor.companyName || v.vendor.businessName || v.vendor.name)
          : vendorsMap[vendorId];
        
        return {
          eventId: event._id,
          eventTitle: event.title,
          eventType: event.type,
          vendorId,
          vendorName: vendorName || "Vendor"
        };
      })
  );

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">View Vendor & Worker Documents</h1>

      {allVendors.length === 0 ? (
        <p className="text-gray-500">No vendors with documents found.</p>
      ) : (
        <div className="bg-white border rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">All Vendors</h2>
          <div className="space-y-3">
            {allVendors.map((vendor, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                <div>
                  <p className="font-medium">{vendor.vendorName}</p>
                  <p className="text-sm text-gray-500">
                    {vendor.eventTitle} ({vendor.eventType})
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSelected({
                      eventId: vendor.eventId,
                      vendorId: vendor.vendorId,
                    })
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
                >
                  View Documents
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected.eventId && selected.vendorId && (
        <VendorDocumentsModal
          eventId={selected.eventId}
          vendorId={selected.vendorId}
          onClose={() => setSelected({ eventId: null, vendorId: null })}
        />
      )}
    </>
  );
}

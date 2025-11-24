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
          ev.registeredVendors.map(v => v.vendor)
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

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">View Vendor & Worker Documents</h1>

      {events.length === 0 ? (
        <p className="text-gray-500">No events with vendors found.</p>
      ) : (
        events.map(event => (
          <div
            key={event._id}
            className="mb-6 bg-white border rounded-xl shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-2">
              {event.title} ({event.type})
            </h2>

            {event.registeredVendors?.length === 0 ? (
              <p className="text-gray-400">No vendors registered.</p>
            ) : (
              <table className="w-full border mt-3">
                <tbody>
                  {event.registeredVendors.map((v, idx) => (
                    <tr key={idx} className="border">
                      <td className="p-3 font-medium">
                        {vendorsMap[v.vendor] || "Vendor"}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() =>
                            setSelected({
                              eventId: event._id,
                              vendorId: v.vendor,
                            })
                          }
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
                        >
                          View Documents
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

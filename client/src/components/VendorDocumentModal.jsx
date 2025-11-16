import { useEffect, useState } from "react";
import API from "../services/api";

export default function VendorDocumentsModal({ eventId, vendorId, onClose }) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDocs = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(
          `/documents/event/${eventId}/vendor/${vendorId}`
        );

        setData(res.data);
      } catch (err) {
        setError("Failed to load documents");
        console.error("Document modal error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId && vendorId) {
      loadDocs();
    }
  }, [eventId, vendorId]);

  if (!eventId || !vendorId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Vendor Documents</h2>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Close
          </button>
        </div>

        {/* LOADING */}
        {loading && <p className="text-gray-600">Loading...</p>}

        {/* ERROR */}
        {error && <p className="text-red-500">{error}</p>}

        {/* CONTENT */}
        {data && (
          <>
            {/* Vendor info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {data.vendor.companyName}
              </h3>

              {/* Tax Card */}
              <div className="mb-4">
                <p className="font-medium">Tax Card</p>
                {data.vendor.taxDocumentUrl ? (
                  <div className="flex gap-4 mt-1">
                    <a
                      href={data.vendor.taxDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View/Download 
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500">No tax card uploaded.</p>
                )}
              </div>

              {/* Logo */}
              <div className="mb-4">
                <p className="font-medium">Company Logo</p>
                {data.vendor.logoUrl ? (
                  <img
                    src={data.vendor.logoUrl}
                    alt="Logo"
                    className="h-24 mt-2 border rounded"
                  />
                ) : (
                  <p className="text-gray-500">No logo uploaded.</p>
                )}
              </div>
            </div>

            {/* Workers */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Workers</h3>
              {data.workers.length === 0 && (
                <p className="text-gray-500">No workers submitted.</p>
              )}

              {data.workers.map((worker, index) => (
                <div
                  key={index}
                  className="border p-3 rounded mb-3 flex gap-4 items-center"
                >
                  <div className="flex-1">
                    <p className="font-medium">{worker.name}</p>
                    <div className="flex gap-4 mt-2">
                      <a
                        href={worker.idPictureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View/Download
                      </a>
                    </div>
                  </div>

                  <img
                    src={worker.idPictureUrl}
                    alt="Worker ID"
                    className="h-24 w-24 object-cover rounded border"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function LoyaltyVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get("/loyalty/vendors");
        const payload = Array.isArray(res.data?.vendors)
          ? res.data.vendors
          : Array.isArray(res.data)
          ? res.data
          : [];
        setVendors(payload);
      } catch (err) {
        console.error("Error fetching loyalty vendors:", err);
        setError(err.response?.data?.message || "Failed to load loyalty partners. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">GUC Loyalty Program Partners</h1>
        <p className="text-gray-600 mt-1">Exclusive deals negotiated for the GUC community.</p>
      </div>

      {loading && <p className="text-gray-500">Loading vendors...</p>}
      {error && <p className="text-red-600 font-medium">{error}</p>}
      {!loading && !error && vendors.length === 0 && (
        <p className="text-gray-600">No vendors available at the moment.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v) => (
          <div
            key={v._id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-2">{v.name}</h2>
            {v.loyaltyDiscountPercent !== undefined && (
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Discount:</strong> {v.loyaltyDiscountPercent}%
              </p>
            )}
            {v.loyaltyPromoCode && (
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Promo Code:</strong> {v.loyaltyPromoCode}
              </p>
            )}
            {v.loyaltyTerms && (
              <p className="mt-3 text-sm text-gray-600">
                <strong className="text-gray-900">Terms & Conditions:</strong> {v.loyaltyTerms}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

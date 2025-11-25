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

        const normalized = payload.map((item, index) => ({
          id:
            item.id ||
            item._id ||
            item.vendorId ||
            item.loyaltyProgramId ||
            (item.promoCode ? `promo-${item.promoCode}` : `loyalty-${index}`),
          companyName: item.companyName || item.name || "",
          contactName: item.contactName || item.contactPerson || item.name || "",
          email: item.email || item.contactEmail || "",
          discountRate:
            typeof item.discountRate === "number"
              ? item.discountRate
              : typeof item.loyaltyDiscountPercent === "number"
              ? item.loyaltyDiscountPercent
              : null,
          promoCode: item.promoCode || item.loyaltyPromoCode || "",
          termsAndConditions: item.termsAndConditions || item.loyaltyTerms || "",
        }));

        setVendors(normalized);
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
            key={v.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Company: {v.companyName || v.contactName || "Loyalty Partner"}
            </h2>
            
            {v.contactName && v.contactName !== v.companyName && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Contact:</span>{" "}
                {v.contactName}
              </p>
            )}
            {v.email && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Email:</span>{" "}
                <a href={`mailto:${v.email}`} className="text-indigo-600 hover:underline">
                  {v.email}
                </a>
              </p>
            )}
            {typeof v.discountRate === "number" && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Discount:</span>{" "}
                {v.discountRate}% off
              </p>
            )}
            {v.promoCode && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Promo Code:</span>{" "}
                {v.promoCode}
              </p>
            )}
            {v.termsAndConditions && (
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Terms & Conditions:</span>{" "}
                {v.termsAndConditions}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

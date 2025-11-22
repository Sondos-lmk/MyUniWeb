import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function LoyaltyVendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/loyalty/vendors", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setVendors(res.data.vendors || []);
      } catch (err) {
        setError("Failed to load loyalty vendors.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
      <h1 className="text-2xl font-bold mb-4">GUC Loyalty Program Partners</h1>

      {loading && <p>Loading vendors...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && vendors.length === 0 && (
        <p>No vendors available at the moment.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v) => (
          <div
            key={v._id}
            className="border rounded-lg shadow p-4 bg-white"
          >
            <h2 className="text-xl font-semibold mb-2">{v.name}</h2>

            {v.loyaltyDiscountPercent !== undefined && (
              <p>
                <strong>Discount:</strong> {v.loyaltyDiscountPercent}%
              </p>
            )}

            {v.loyaltyPromoCode && (
              <p>
                <strong>Promo Code:</strong> {v.loyaltyPromoCode}
              </p>
            )}

            {v.loyaltyTerms && (
              <p className="mt-2 text-gray-700">
                <strong>Terms & Conditions:</strong> {v.loyaltyTerms}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import API from "../services/api";
import { ShoppingBag, Mail, Tag, Percent, FileText, ExternalLink } from "lucide-react";

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
          logo: item.logo || "",
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GUC Loyalty Program Partners</h1>
        <p className="text-slate-600">Exclusive deals negotiated for the GUC community</p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading loyalty partners...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}
      
      {!loading && !error && vendors.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No loyalty partners available at the moment</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((v) => {
          // Get vendor logo URL
          const vendorLogo = v.logo ? `http://localhost:4000${v.logo}` : null;

          return (
          <div
            key={v.id}
            className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
          >
            {/* Vendor Header with Gradient */}
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white relative">
              {/* Discount Badge - Top Right */}
              {typeof v.discountRate === "number" && (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">
                  {v.discountRate}% OFF
                </div>
              )}
              
              {/* Vendor Logo */}
              {vendorLogo ? (
                <div className="w-16 h-16 bg-white rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  <img src={vendorLogo} alt={v.companyName} className="w-full h-full object-contain p-1" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-white rounded-lg mb-3 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-cyan-600" />
                </div>
              )}
              
              {/* Company Name */}
              <h3 className="text-xl font-bold mb-1">
                {v.companyName || v.contactName || "Loyalty Partner"}
              </h3>
              
              {/* Contact Name if different from company */}
              {v.contactName && v.contactName !== v.companyName && (
                <p className="text-sm text-cyan-50">Contact: {v.contactName}</p>
              )}
            </div>

            <div className="p-5 space-y-3">
              {/* Email */}
              {v.email && (
                <div className="flex items-start gap-2">
                  <Mail className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Email</div>
                    <a 
                      href={`mailto:${v.email}`} 
                      className="text-sm font-semibold text-cyan-600 hover:underline break-all"
                    >
                      {v.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Discount Rate */}
              {typeof v.discountRate === "number" && (
                <div className="flex items-start gap-2">
                  <Percent className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Discount Rate</div>
                    <div className="text-sm font-semibold text-slate-900">{v.discountRate}% off</div>
                  </div>
                </div>
              )}

              {/* Promo Code */}
              {v.promoCode && (
                <div className="flex items-start gap-2">
                  <Tag className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Promo Code</div>
                    <div className="text-sm font-semibold text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                      {v.promoCode}
                    </div>
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              {v.termsAndConditions && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <div className="text-xs text-slate-500 font-medium">Terms & Conditions</div>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-3">
                    {v.termsAndConditions}
                  </p>
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

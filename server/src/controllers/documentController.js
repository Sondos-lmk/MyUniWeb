import { Vendor } from "../models/Users/Vendor.js";
import { Booth } from "../models/Events/Booth.js";
import { Bazaar } from "../models/Events/Bazaar.js";

function buildAbsoluteUrl(req, relativePath) {
  if (!relativePath) return null;

  const base =
    process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;

  return `${base}${relativePath}`;
}

export async function getVendorDocumentsForEvent(req, res) {
  try {
    const { eventId, vendorId } = req.params;

    // 1) Find vendor object
    const vendor = await Vendor.findById(vendorId);
    if (!vendor)
      return res.status(404).json({ message: "Vendor not found" });

    // 2) Find event (Booth or Bazaar)
    let event = await Booth.findById(eventId);
    if (!event) event = await Bazaar.findById(eventId);

    if (!event)
      return res.status(404).json({ message: "Event not found" });

    // 3) Find vendor's event application
    const vendorApplication = event.registeredVendors.find(
      (rv) => rv.vendor.toString() === vendorId
    );

    if (!vendorApplication)
      return res.status(404).json({
        message: "Vendor did not register for this event",
      });

    // 4) Build structured response
    const vendorDocs = {
      id: vendor._id,
      companyName: vendor.companyName,
      taxDocumentUrl: buildAbsoluteUrl(req, vendor.taxDocument),
      logoUrl: buildAbsoluteUrl(req, vendor.logo),
    };

    const workers = (vendorApplication.workers || []).map((w) => ({
      name: w.name,
      idPictureUrl: buildAbsoluteUrl(req, w.idPicture),
      addedAt: w.addedAt,
    }));

    return res.json({
      vendor: vendorDocs,
      workers,
    });

  } catch (err) {
    console.error("Error fetching vendor documents:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch vendor documents" });
  }
}

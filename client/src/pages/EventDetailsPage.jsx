// client/src/pages/EventDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import EditEventForm from "../components/EditEventForm";
import GenerateVisitorQRModal from "../components/GenerateVisitorQRModal";
import DashboardLayout from "../components/DashboardLayout";
import {
  ListChecks,
  GraduationCap,
  ClipboardList,
  Dumbbell,
  Store,
  Folder,
  FileText,
  ArrowLeft,
  BarChart3,
  MessageSquare,
  ShoppingBag,
  Package,
  Users,
} from "lucide-react";

const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "—");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

export default function EventDetailsPage() {
  const { id } = useParams(); // event id
  const navigate = useNavigate();
  const location = useLocation();

  //const fromAdminUpcoming = location.state?.from === "admin-upcoming";
  //const isAdminView = fromAdminUpcoming || location.pathname.startsWith("/admin/");
  //const headerSubLabel = isAdminView
    //? "Administrator · Event Details"
    //: "Event Officer · More Information";

  const openQR = location.state?.openQR;
  const fromBoothsPage = location.state?.fromBoothsPage === true;




  // automatically switch to QR when coming from booths
  useEffect(() => {
    if (fromBoothsPage || openQR) {
      setActiveTab("qr");
    }
  }, [fromBoothsPage, openQR]);

  // now safe to create this!
  const forceQrOnly = fromBoothsPage === true;


    // ---------- Layout state (sidebar) ----------
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState("attendees");

  // ---------- Existing logic ----------
  const fromAdminUpcoming = location.state?.from === "admin-upcoming";
  const isAdminView = fromAdminUpcoming || location.pathname.startsWith("/admin/");
  const headerSubLabel = isAdminView
    ? "Administrator · Event Details"
    : "Event Officer · More Information";

  // ✅ Dynamic sidebar based on role
  const sidebarItems = isAdminView
    ? [
        // ADMIN SIDEBAR - Navigate back to admin dashboard with specific tab
        { key: "overview", label: "Overview", icon: GraduationCap, onClick: () => navigate("/admin", { state: { initialTab: "overview" } }) },
        { key: "upcoming", label: "Upcoming Events", icon: BarChart3, onClick: () => navigate("/admin", { state: { initialTab: "upcoming" } }) },
        { key: "allComments", label: "Events Reviews", icon: MessageSquare, onClick: () => navigate("/admin", { state: { initialTab: "allComments" } }) },
        { key: "availableBooths", label: "Available Booths", icon: ShoppingBag, onClick: () => navigate("/admin", { state: { initialTab: "availableBooths" } }) },
        { key: "vendorRequests", label: "Vendor Requests", icon: Package, onClick: () => navigate("/admin", { state: { initialTab: "vendorRequests" } }) },
        { key: "loyaltyVendors", label: "Loyalty Vendors", icon: Store, onClick: () => navigate("/admin", { state: { initialTab: "loyaltyVendors" } }) },
        { key: "documents", label: "View Documents", icon: Folder, onClick: () => navigate("/admin", { state: { initialTab: "documents" } }) },
        { key: "users", label: "All Users", icon: Users, onClick: () => navigate("/admin", { state: { initialTab: "users" } }) },
        {
          key: "reports",
          label: "Reports",
          icon: FileText,
          isCollapsible: true,
          isOpen: isReportsOpen,
          onToggle: () => setIsReportsOpen((s) => !s),
          subItems: [
            {
              label: "Attendees Report",
              onClick: () => {
                setSelectedReport("attendees");
                navigate("/admin", { state: { initialTab: "reports", selectedReport: "attendees" } });
                setIsReportsOpen(true);
              },
            },
            {
              label: "Revenue Report",
              onClick: () => {
                setSelectedReport("revenue");
                navigate("/admin", { state: { initialTab: "reports", selectedReport: "revenue" } });
                setIsReportsOpen(true);
              },
            },
          ],
        },
      ]
    : [
        // EVENT OFFICER SIDEBAR - Match EventOfficerDashboard.jsx exact order
        { to: "/eventOfficer/dashboard", label: "Overview", icon: GraduationCap },
        { to: "/eventOfficer/approveWorkshops", label: "Workshops", icon: ListChecks },
        { to: "/eventOfficer/all-events", label: "All Events", icon: ClipboardList },
        { to: "/eventOfficer/available-booths", label: "Available Booths", icon: ShoppingBag },
        { to: "/gym-schedule", label: "Gym Schedule", icon: Dumbbell },
        { to: "/eventOfficer/loyalty-vendors", label: "Loyalty Vendors", icon: Store },
        { to: "/eventOfficer/documents", label: "View Documents", icon: Folder },
        {
          key: "reports",
          label: "Reports",
          icon: FileText,
          isCollapsible: true,
          isOpen: isReportsOpen,
          onToggle: () => setIsReportsOpen((s) => !s),
          subItems: [
            {
              label: "Attendees Report",
              onClick: () => {
                setSelectedReport("attendees");
                navigate("/eventOfficer/attendees-report");
                setIsReportsOpen(true);
              },
            },
            {
              label: "Revenue Report",
              onClick: () => {
                setSelectedReport("revenue");
                navigate("/eventOfficer/revenue-report");
                setIsReportsOpen(true);
              },
            },
          ],
        },
      ];

  // ✅ Back button handler
  const handleBackClick = () => {
    if (fromBoothsPage) {
      // Coming from Available Booths page (with QR generation)
      if (isAdminView) {
        navigate("/admin", { state: { initialTab: "availableBooths" } });
      } else {
        navigate("/eventOfficer/available-booths");
      }
    } else if (isAdminView) {
      // Coming from Admin Dashboard
      navigate("/admin", { state: { initialTab: "upcoming" } });
    } else {
      // Coming from Event Officer Dashboard
      navigate("/eventOfficer/all-events");
    }
  };

  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState(fromBoothsPage ? "qr" : "info"); // "info" | "vendors" | "qr"

  const [visitors, setVisitors] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [vendorProfiles, setVendorProfiles] = useState({});
  const [loadingVendorProfiles, setLoadingVendorProfiles] = useState(false);

  const [coverPreview, setCoverPreview] = useState(null); // local-only image

  const showQrFeatures = !isAdminView && (event?.type === 'booth' || event?.type === 'bazaar');

  useEffect(() => {
    if (!fromBoothsPage && !showQrFeatures && activeTab === "qr") {
      setActiveTab("info");
    }
  }, [fromBoothsPage, showQrFeatures, activeTab]);

  useEffect(() => {
    if (event && event.type !== "bazaar" && activeTab === "vendors") {
      setActiveTab("info");
    }
  }, [event, activeTab]);

  // ───────────────── Event Details ─────────────────
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoadingEvent(true);
        const res = await API.get(`/events/${id}`);
        // your GET /events/:id returns the event object directly
        setEvent(res.data);
        setError("");
      } catch (err) {
        console.error("Error loading event details:", err);
        setError("Failed to load event details.");
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [id]);

  // ───────────────── Vendor Profiles ─────────────────
  useEffect(() => {
    if (!event || event.type !== "bazaar") {
      setVendorProfiles({});
      setLoadingVendorProfiles(false);
      return;
    }

    const vendorIds = Array.from(
      new Set(
        (event.registeredVendors || [])
          .map((v) => {
            // Handle both populated objects and ID strings
            return typeof v.vendor === 'object' && v.vendor !== null ? v.vendor._id : v.vendor;
          })
          .filter(id => id && id !== 'null')
      )
    );

    if (vendorIds.length === 0) {
      setVendorProfiles({});
      return;
    }

    let cancelled = false;

    const fetchVendorProfiles = async () => {
      try {
        setLoadingVendorProfiles(true);
        const responses = await Promise.all(
          vendorIds.map((vendorId) =>
            API.get(`/users/${vendorId}`)
              .then((res) => res.data)
              .catch((err) => {
                console.error(`Error loading vendor ${vendorId}:`, err);
                return null;
              })
          )
        );

        if (cancelled) return;

        const profileMap = {};
        responses.forEach((profile) => {
          if (profile?._id) {
            profileMap[profile._id] = profile;
          }
        });
        setVendorProfiles(profileMap);
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching vendor profiles:", err);
        }
      } finally {
        if (!cancelled) {
          setLoadingVendorProfiles(false);
        }
      }
    };

    fetchVendorProfiles();

    return () => {
      cancelled = true;
    };
  }, [event]);

  // ───────────────── Visitors / QR Codes ─────────────────
  const fetchVisitors = async () => {
    try {
      setLoadingVisitors(true);
      const res = await API.get(`/events/${id}/external-visitors`);
      setVisitors(res.data.visitors || []);
    } catch (err) {
      console.error("Error loading visitors:", err);
    } finally {
      setLoadingVisitors(false);
    }
  };

  // Load visitors when switching to QR tab
  useEffect(() => {
    if (activeTab === "qr") {
      fetchVisitors();
    }
  }, [activeTab]);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCoverPreview(reader.result); // data URL preview
    };
    reader.readAsDataURL(file);
  };

  const badgeColor = (type) => {
    switch (type) {
      case "trip":
        return "bg-blue-100 text-blue-700";
      case "bazaar":
        return "bg-amber-100 text-amber-700";
      case "conference":
        return "bg-emerald-100 text-emerald-700";
      case "workshop":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // ---------- Loading / error states wrapped in DashboardLayout ----------
  if (loadingEvent) {
    return (
      <DashboardLayout
        dashboardTitle={isAdminView ? "Admin Dashboard" : "Event Officer Dashboard"}
        roleLabel={isAdminView ? "Administrator" : "Events Officer"}
        roleColor={isAdminView ? "bg-indigo-600" : "bg-cyan-600"}
        sidebarItems={sidebarItems}
        extraSidebarProps={{ isReportsOpen, selectedReport }}
      >
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-slate-500">Loading event details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout
        dashboardTitle={isAdminView ? "Admin Dashboard" : "Event Officer Dashboard"}
        roleLabel={isAdminView ? "Administrator" : "Events Officer"}
        roleColor={isAdminView ? "bg-indigo-600" : "bg-cyan-600"}
        sidebarItems={sidebarItems}
        extraSidebarProps={{ isReportsOpen, selectedReport }}
      >
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-red-600">{error || "Event not found."}</p>
        </div>
      </DashboardLayout>
    );
  }

  const isBazaarEvent = event.type === "bazaar";
  const allVendorRegistrations = isBazaarEvent ? event.registeredVendors || [] : [];
  // Filter to only show approved and paid vendors in the vendors tab
  const vendorRegistrations = allVendorRegistrations.filter(
    (v) => v.status === "approved" && v.paymentStatus === "paid"
  );
  const approvedVendorsCount = allVendorRegistrations.filter((v) => v.status === "approved").length;

  // ---------- Main content inside DashboardLayout ----------
  return (
    <DashboardLayout
      dashboardTitle={isAdminView ? "Admin Dashboard" : "Event Officer Dashboard"}
      roleLabel={isAdminView ? "Administrator" : "Events Officer"}
      roleColor={isAdminView ? "bg-indigo-600" : "bg-cyan-600"}
      sidebarItems={sidebarItems}
      extraSidebarProps={{ isReportsOpen, selectedReport }}
    >
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>
            {fromBoothsPage 
              ? "Back to Available Booths" 
              : isAdminView 
                ? "Back to Events" 
                : "Back to Events"}
          </span>
        </button>

        {/* Top header row: Title + Tag */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
            <p className="text-xs text-slate-500 mt-1">{headerSubLabel}</p>
          </div>

          <span
            className={
              "px-3 py-1 rounded-full text-xs font-semibold ml-4 " +
              badgeColor(event.type)
            }
          >
            {event.type}
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200 px-6 pt-4 flex gap-6">

            {fromBoothsPage ? (
              <>
                {/* ONLY QR TAB */}
                <button
                  className={`pb-3 text-sm font-semibold ${
                    activeTab === "qr"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setActiveTab("qr")}
                >
                  QR Codes
                </button>
              </>
            ) : (
              <>
                {/* NORMAL TABS */}
                <button
                  className={`pb-3 text-sm font-semibold ${
                    activeTab === "info"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setActiveTab("info")}
                >
                  Information
                </button>

                {isBazaarEvent && (
                  <button
                    className={`pb-3 text-sm font-semibold ${
                      activeTab === "vendors"
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setActiveTab("vendors")}
                  >
                    Vendors Participating
                  </button>
                )}

                { showQrFeatures && (
                  <button
                    className={`pb-3 text-sm font-semibold ${
                      activeTab === "qr"
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setActiveTab("qr")}
                  >
                    QR Codes
                  </button>
                )}
              </>
            )}

          </div>

          {/* Tab Content */}
          <div className="px-6 py-6 space-y-6">
            {!fromBoothsPage && activeTab === "info" && (
              <div className="grid md:grid-cols-[2fr,1fr] gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-3">Event Details</h2>

                  {event.desc && (
                    <p className="text-sm text-slate-700 mb-4">{event.desc}</p>
                  )}

                  {event.fullAgenda && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-slate-800 mb-1">
                        Agenda
                      </h3>
                      <p className="text-sm text-slate-700 whitespace-pre-line">
                        {event.fullAgenda}
                      </p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {event.location && (
                      <div>
                        <div className="text-slate-500">Location</div>
                        <div className="font-medium">{event.location}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-slate-500">Start</div>
                      <div className="font-medium">
                        {fmtDateTime(event.startDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">End</div>
                      <div className="font-medium">
                        {fmtDateTime(event.endDate)}
                      </div>
                    </div>
                    {event.registrationDeadline && (
                      <div>
                        <div className="text-slate-500">
                          Registration Deadline
                        </div>
                        <div className="font-medium">
                          {fmtDateTime(event.registrationDeadline)}
                        </div>
                      </div>
                    )}

                    {event.price !== undefined && (
                      <div>
                        <div className="text-slate-500">Price</div>
                        <div className="font-medium">{event.price} EGP</div>
                      </div>
                    )}

                    {Array.isArray(event.allowedRoles) && (
                      <div className="sm:col-span-2">
                        <div className="text-slate-500">Allowed Roles</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {event.allowedRoles.map((r) => (
                            <span
                              key={r}
                              className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right column: Cover + actions */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">
                      Event Cover Image
                    </h3>
                    <div className="border border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-xs text-slate-500">
                      {coverPreview ? (
                        <img
                          src={coverPreview}
                          alt="Event cover"
                          className="w-full h-40 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <p className="mb-2 text-center">
                          No image selected. You can upload a cover.
                        </p>
                      )}
                      <label className="cursor-pointer inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverChange}
                        />
                      </label>
                    </div>
                  </div>

                  {!isAdminView && (
                    <div className="pt-2">
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="w-full rounded-xl px-4 py-2 bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
                      >
                        Edit Event
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!fromBoothsPage && activeTab === "vendors" && isBazaarEvent && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Vendors Participating
                    </h2>
                    <p className="text-sm text-slate-500">
                      Total registered: {vendorRegistrations.length} · Approved:{" "}
                      {approvedVendorsCount}
                    </p>
                  </div>
                </div>

                {loadingVendorProfiles ? (
                  <p className="text-sm text-slate-500">
                    Loading vendor details...
                  </p>
                ) : vendorRegistrations.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No vendors have registered for this bazaar yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-slate-200 rounded-xl text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="p-3 text-left border-b">Vendor</th>
                          <th className="p-3 text-left border-b">Contact</th>
                          <th className="p-3 text-left border-b">
                            Representatives
                          </th>
                          <th className="p-3 text-left border-b">Booth Size</th>
                          <th className="p-3 text-left border-b">
                            Final Price
                          </th>
                          <th className="p-3 text-left border-b">Payment</th>
                          <th className="p-3 text-left border-b">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendorRegistrations.map((registration) => {
                          // Handle both populated vendor objects and vendor IDs
                          const vendorId = typeof registration.vendor === 'object' && registration.vendor !== null
                            ? registration.vendor._id
                            : registration.vendor;
                          
                          const profile = typeof registration.vendor === 'object' && registration.vendor !== null
                            ? registration.vendor
                            : (vendorId ? vendorProfiles[vendorId] : null);
                          
                          const vendorName =
                            profile?.companyName ||
                            profile?.name ||
                            vendorId ||
                            "—";
                          const vendorEmail =
                            profile?.companyEmail ||
                            profile?.email ||
                            registration.reps?.[0]?.email ||
                            "—";
                          const vendorPhone =
                            profile?.phone || profile?.contactNumber || null;
                          const paymentStatus =
                            registration.paymentStatus || "unpaid";
                          const statusBadge =
                            registration.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : registration.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700";

                          return (
                            <tr
                              key={registration._id || vendorName}
                              className="border-b last:border-b-0"
                            >
                              <td className="p-3 align-top">
                                <div className="font-semibold text-slate-800">
                                  {vendorName}
                                </div>
                                {profile?.website && (
                                  <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-indigo-600"
                                  >
                                    {profile.website}
                                  </a>
                                )}
                              </td>
                              <td className="p-3 align-top text-slate-700">
                                {vendorEmail !== "—" && <div>{vendorEmail}</div>}
                                {vendorPhone ? (
                                  <div className="text-xs text-slate-500">
                                    {vendorPhone}
                                  </div>
                                ) : (
                                  vendorEmail === "—" && <span>—</span>
                                )}
                              </td>
                              <td className="p-3 align-top">
                                {registration.reps?.length ? (
                                  <ul className="space-y-1">
                                    {registration.reps.map((rep, idx) => (
                                      <li
                                        key={`${registration._id || vendorName}-rep-${idx}`}
                                        className="text-slate-700"
                                      >
                                        {rep.name}
                                        <span className="text-xs text-slate-500">
                                          {" "}
                                          ({rep.email})
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span>—</span>
                                )}
                              </td>
                              <td className="p-3 align-top">
                                {registration.boothSize || "—"}
                              </td>
                              <td className="p-3 align-top">
                                {registration.finalPrice
                                  ? `${registration.finalPrice.toLocaleString()} EGP`
                                  : "—"}
                                {registration.startDate && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    {fmtDate(registration.startDate)} -{" "}
                                    {fmtDate(
                                      registration.endDate ||
                                        registration.startDate
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 align-top">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    paymentStatus === "paid"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {paymentStatus}
                                </span>
                                {registration.paymentDeadline && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    Due {fmtDate(registration.paymentDeadline)}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 align-top">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge}`}
                                >
                                  {registration.status || "pending"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            { activeTab === "qr" && showQrFeatures && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Visitor QR Codes</h2>
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="rounded-xl px-4 py-2 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                  >
                    Generate New QR
                  </button>
                </div>

                {loadingVisitors ? (
                  <p className="text-sm text-slate-500">
                    Loading visitor QR codes...
                  </p>
                ) : visitors.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No visitor QR codes generated yet for this event.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {visitors.map((v, idx) => (
                      <div
                        key={v.code || idx}
                        className="border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                      >
                        <div className="flex-1 text-sm">
                          <div className="font-semibold">
                            {v.name}{" "}
                            {v.email && (
                              <span className="text-slate-500 text-xs">
                                ({v.email})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            National ID: {v.nationalId}
                          </div>
                          <div className="text-xs text-slate-500">
                            Code: {v.code}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Created: {fmtDateTime(v.createdAt)}
                          </div>
                        </div>

                        {v.qrCode && (
                          <div className="flex flex-col items-center gap-2">
                            <img
                              src={v.qrCode}
                              alt="Visitor QR"
                              className="w-24 h-24 border rounded-lg"
                            />
                            <a
                              href={v.qrCode}
                              download={`visitor_qr_${v.name || "visitor"}.png`}
                              className="text-xs px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold"
                            >
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {!isAdminView && showEditModal && (
          <EditEventForm
            eventId={event._id}
            onClose={() => setShowEditModal(false)}
          />
        )}

        {showQrFeatures && showQRModal && (
          <GenerateVisitorQRModal
            eventId={event._id}
            onClose={() => setShowQRModal(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

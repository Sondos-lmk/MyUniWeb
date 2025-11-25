import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import EditEventForm from "../components/EditEventForm";
import GenerateVisitorQRModal from "../components/GenerateVisitorQRModal";

const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "—");

export default function EventDetailsPage() {
  const { id } = useParams();             // event id
  const navigate = useNavigate();
  const location = useLocation();

  const fromAdminUpcoming = location.state?.from === "admin-upcoming";
  const isAdminView = fromAdminUpcoming || location.pathname.startsWith("/admin/");
  const backDestination = isAdminView ? "/admin" : "/eventOfficer/all-events";
  const backState = isAdminView ? { initialTab: "upcoming" } : undefined;
  const backLabel = isAdminView ? "← Back to Upcoming Events" : "← Back to All Events";
  const headerSubLabel = isAdminView
    ? "Administrator · Event Details"
    : "Event Officer · More Information";

  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("info"); // "info" | "qr"

  const [visitors, setVisitors] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const [coverPreview, setCoverPreview] = useState(null); // local-only image

  const showQrFeatures = !isAdminView;

  useEffect(() => {
    if (!showQrFeatures && activeTab !== "info") {
      setActiveTab("info");
    }
  }, [showQrFeatures, activeTab]);

  const handleBack = () => {
    if (isAdminView) {
      navigate(backDestination, { state: backState });
    } else {
      navigate(backDestination);
    }
  };

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
    // TODO: if later you want to save it, send `file` to backend here.
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

  if (loadingEvent) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-slate-500">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-red-600">{error || "Event not found."}</p>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 text-sm font-semibold"
        >
          {backLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Top header row: Back + Title + Tag */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
        >
          {backLabel}
        </button>

        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {event.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {headerSubLabel}
          </p>
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
          {showQrFeatures && (
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
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6">
          {activeTab === "info" || !showQrFeatures ? (
            <>
              {/* Information Tab */}
              <div className="grid md:grid-cols-[2fr,1fr] gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-3">
                    Event Details
                  </h2>

                  {event.desc && (
                    <p className="text-sm text-slate-700 mb-4">
                      {event.desc}
                    </p>
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
                        <div className="font-medium">
                          {event.price} EGP
                        </div>
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
            </>
          ) : (
            <>
              {/* QR Codes Tab */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Visitor QR Codes</h2>
                {showQrFeatures && (
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="rounded-xl px-4 py-2 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                  >
                    Generate New QR
                  </button>
                )}
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
            </>
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
  );
}

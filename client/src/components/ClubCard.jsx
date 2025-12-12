import React from "react";
import {
  FileText,
  Calendar,
  Image as ImageIcon,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function ClubCard({ club, onApply, applicationStatus }) {
  const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

const logoUrl = club.logo
  ? `${API_BASE}${club.logo}`
  : null;
  console.log("Club:", club.name);
  console.log("club.logo =", club.logo);
  console.log("logoUrl =", logoUrl);


  const presidentName =
    club.president?.name ||
    club.president?.email ||
    club.presidentName ||
    "Unknown";

  // ========= STATUS CONFIG =========
  const statusConfig = {
    pending: {
      label: "Pending Review",
      bg: "bg-yellow-100 text-yellow-700",
      icon: <Clock className="w-4 h-4" />,
      disabled: true,
      buttonLabel: "PENDING"
    },
    accepted: {
      label: "Accepted",
      bg: "bg-green-100 text-green-700",
      icon: <CheckCircle className="w-4 h-4" />,
      disabled: true,
      buttonLabel: "ACCEPTED"
    },
    rejected: {
      label: "Rejected",
      bg: "bg-red-100 text-red-700",
      icon: <XCircle className="w-4 h-4" />,
      disabled: false,     // ⭐ You can apply again
      buttonLabel: "Apply Again"
    }
  };

  const status = applicationStatus ? statusConfig[applicationStatus] : null;
  const applicationInfoMessage = (() => {
    if (!applicationStatus) {
      return "You can apply at any time. HR members will review your application during the next recruitment cycle.";
    }

    if (applicationStatus === "pending") {
      return "Your application is under review by the club HR team.";
    }

    if (applicationStatus === "accepted") {
      return "You are already a member of this club.";
    }

    if (applicationStatus === "rejected") {
      return "Your previous application was rejected. You may apply again in the next cycle.";
    }

    return null;
  })();


  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white relative">

        {/* STATUS BADGE */}
        {status && (
          <div
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${status.bg}`}
          >
            {status.icon}
            {status.label}
          </div>
        )}

        {/* LOGO */}
        {logoUrl ? (
          <div className="w-16 h-16 bg-white rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            <img src={logoUrl} alt={club.name} className="w-full h-full object-contain p-1" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-white rounded-lg mb-3 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-cyan-600" />
          </div>
        )}

        <h3 className="text-xl font-bold mb-1">{club.name}</h3>
        <p className="text-sm text-cyan-50">President: {presidentName}</p>
      </div>

      {/* BODY */}
      <div className="p-5 space-y-3">

        {/* OVERVIEW */}
        {club.desc && (
          <div className="bg-slate-50 rounded-lg p-3 relative group">
            <div className="flex items-center gap-1 mb-1">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">Club Overview</span>
            </div>
            {/* Preview text */}
            <p className="text-sm text-slate-700 line-clamp-3 group-hover:hidden">
              {club.desc}
            </p>
            <p className="text-[11px] text-cyan-600 mt-1 group-hover:hidden">
              Hover to read more
            </p>
            {/* Full text on hover */}
            <div className="mt-2 hidden group-hover:block">
              <p className="text-sm text-slate-700">
                {club.desc}
              </p>
            </div>
          </div>
        )}

        {/* EXTRA DETAILS */}
        {(club.category || club.meetingDay || club.meetingLocation) && (
          <div className="flex items-start gap-2 text-sm text-slate-700">
            <Calendar className="w-4 h-4 mt-0.5 text-cyan-600" />
            <div className="space-y-0.5">
              {club.category && (
                <p><span className="font-medium">Category:</span> {club.category}</p>
              )}
              {club.meetingDay && (
                <p><span className="font-medium">Meets:</span> {club.meetingDay}</p>
              )}
              {club.meetingLocation && (
                <p><span className="font-medium">Location:</span> {club.meetingLocation}</p>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex justify-end">
            <button
              disabled={status?.disabled}
              onClick={() => onApply(club)}
              className={`px-4 py-2 rounded-lg text-white text-sm font-semibold
                ${status?.disabled
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-700"
                }`}
            >
              {status ? status.buttonLabel : "Apply"}
            </button>
          </div>

          {applicationInfoMessage && (
            <p className="text-xs text-slate-500 text-right">
              {applicationInfoMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

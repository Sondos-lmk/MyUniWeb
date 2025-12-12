import React from "react";
import { Image as ImageIcon, User, FileText } from "lucide-react";

export default function ClubCreationRequestCard({ request, onApprove, onReject }) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const logoUrl = request.logo ? `${API_BASE}${request.logo}` : null;

  const badge =
    request.status === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : request.status === "accepted"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={request.name}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <ImageIcon className="w-7 h-7 text-slate-400" />
            )}
          </div>

          {/* Main Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold">{request.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge}`}>
                {request.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-2 space-y-2">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-500 font-medium">Description</span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{request.desc}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-500 font-medium">Reason</span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{request.reason}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4 text-slate-500" />
                <span className="font-medium">Requested by:</span>
                <span>{request.student?.name || request.student?.email || "Unknown"}</span>
                {request.student?.email && (
                  <span className="text-slate-400">({request.student.email})</span>
                )}
              </div>

              {request.status === "rejected" && request.rejectionReason && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
                  <span className="font-semibold">Rejection reason:</span>{" "}
                  {request.rejectionReason}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {request.status === "pending" && (
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={onApprove}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-sm font-semibold hover:from-cyan-700 hover:to-blue-800"
            >
              Approve
            </button>
            <button
              onClick={onReject}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

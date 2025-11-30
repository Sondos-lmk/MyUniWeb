import React, { useEffect, useState } from "react";
import { X, MapPin, Calendar, Clock, Users, DollarSign, User, Building } from "lucide-react";
import API from "../services/api";

const badgeColor = (type) => {
  switch (type) {
    case "trip": return "bg-blue-100 text-blue-700";
    case "bazaar": return "bg-amber-100 text-amber-700";
    case "conference": return "bg-emerald-100 text-emerald-700";
    case "workshop": return "bg-purple-100 text-purple-700";
    case "gym": return "bg-rose-100 text-rose-700";
    default: return "bg-slate-100 text-slate-700";
  }
};

const fmt = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

export default function EventDetailsModal({ eventId, onClose }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await API.get(`/events/${eventId}`);
        setEvent(res.data);
      } catch (err) {
        console.error("Error fetching event details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  if (!eventId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Event Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading event details...</p>
            </div>
          ) : event ? (
            <div className="space-y-6">
              {/* Title and Type */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-3xl font-bold text-slate-900">{event.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor(event.type)}`}>
                  {event.type}
                </span>
              </div>

              {/* Description */}
              {event.desc && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                  <p className="text-slate-700">{event.desc}</p>
                </div>
              )}

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                {(event.location || event.locationInPlatform) && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-slate-500">Location</div>
                      <div className="font-semibold text-slate-900">
                        {event.location || event.locationInPlatform}
                      </div>
                    </div>
                  </div>
                )}

                {/* Start Date */}
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-slate-500">Start Date</div>
                    <div className="font-semibold text-slate-900">{fmt(event.startDate || event.date)}</div>
                  </div>
                </div>

                {/* End Date */}
                {event.endDate && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-slate-500">End Date</div>
                      <div className="font-semibold text-slate-900">{fmt(event.endDate)}</div>
                    </div>
                  </div>
                )}

                {/* Registration Deadline */}
                {event.registrationDeadline && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <Clock className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-slate-500">Registration Deadline</div>
                      <div className="font-semibold text-slate-900">{fmt(event.registrationDeadline)}</div>
                    </div>
                  </div>
                )}

                {/* Max Participants */}
                {event.maxParticipants && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <Users className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-slate-500">Max Participants</div>
                      <div className="font-semibold text-slate-900">{event.maxParticipants}</div>
                    </div>
                  </div>
                )}

                {/* Price */}
                {event.price !== undefined && event.price !== null && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <DollarSign className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-slate-500">Price</div>
                      <div className="font-semibold text-slate-900">
                        {event.price === 0 ? "Free" : `$${event.price}`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status */}
                {event.status && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <Building className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-slate-500">Status</div>
                      <div className="font-semibold text-slate-900 capitalize">{event.status}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Professors Participating (for workshops) */}
              {event.type === "workshop" && event.professorsParticipating && event.professorsParticipating.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-600" />
                    Professors Participating
                  </h4>
                  <div className="space-y-2">
                    {event.professorsParticipating.map((prof, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-700">
                        <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                        <span>{prof.name || prof.email || "Professor"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registered Users Count */}
              {event.registeredUsers && event.registeredUsers.length > 0 && (
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-600" />
                    <span className="font-semibold text-slate-900">
                      {event.registeredUsers.length} {event.registeredUsers.length === 1 ? "person" : "people"} registered
                    </span>
                  </div>
                </div>
              )}

              {/* Additional Details for specific event types */}
              {event.type === "gym" && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Gym Session Details</h4>
                  {event.sessionType && (
                    <p className="text-slate-700"><span className="font-medium">Type:</span> {event.sessionType}</p>
                  )}
                  {event.time && (
                    <p className="text-slate-700"><span className="font-medium">Time:</span> {event.time}</p>
                  )}
                  {event.duration && (
                    <p className="text-slate-700"><span className="font-medium">Duration:</span> {event.duration}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600">
              Event not found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

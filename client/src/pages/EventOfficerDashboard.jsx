import { useAuth } from "../context/AuthContext";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UpcomingEvents from "../components/UpcomingEvents.jsx";
import AttendeesReport from "../components/AttendeesReport";
import RevenueReport from "../components/RevenueReport";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Dumbbell, Store, Archive, GraduationCap, ArrowLeft, ChevronDown, Users, ClipboardList, MessageSquare, ListChecks, FileText, Folder } from "lucide-react";
import EventFormPage from "../components/EventFormPage";
import ApprovedEvents from "../components/ApprovingEvents";
import CreateGymSession from "./CreateGymSession";
import EventOfficerAnalytics from "../components/EventOfficerAnalytics";

function EventOfficerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeQuickAction, setActiveQuickAction] = React.useState(null);

  // Collapsible Reports state
  const [reportsOpen, setReportsOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState('attendees');

  const sidebarItems = [
    { to: "/eventOfficer/dashboard", label: "Overview", icon: GraduationCap },
    { to: "/eventOfficer/approveWorkshops", label: "Workshops", icon: ListChecks },
    { to: "/eventOfficer/all-events", label: "All Events", icon: ClipboardList },
    { to: "/gym-schedule", label: "Gym Schedule", icon: Dumbbell },
    { to: "/eventOfficer/loyalty-vendors", label: "Loyalty Vendors", icon: Store },
    { to: "/eventOfficer/documents", label: "View Documents", icon: Folder },
    // Collapsible Reports group (Admin-style shape)
    {
      key: "reports",
      label: "Reports",
      icon: FileText,
      isCollapsible: true,
      isOpen: reportsOpen,
      onToggle: () => setReportsOpen((v) => !v),
      subItems: [
        { label: "Attendees Report", onClick: () => { setSelectedReport('attendees'); navigate('/eventOfficer/attendees-report'); setReportsOpen(true); } },
        { label: "Revenue Report", onClick: () => { setSelectedReport('revenue'); navigate('/eventOfficer/revenue-report'); setReportsOpen(true); } },
      ],
    },
  ];

  return (
    <DashboardLayout dashboardTitle="Event Officer Dashboard" roleLabel="Events Officer" roleColor="bg-cyan-600" sidebarItems={sidebarItems} extraSidebarProps={{ isReportsOpen: reportsOpen, selectedReport }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions Only (Overview) */}

        {/* Quick Actions */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveQuickAction((v) => (v === 'create-event' ? null : 'create-event'))}
                className={`w-full h-16 text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 flex items-center justify-center gap-2 text-white rounded-lg ${activeQuickAction === 'create-event' ? 'ring-2 ring-cyan-500' : ''}`}
              >
                <Calendar className="w-5 h-5" />
                Create Event
              </button>

              <button
                onClick={() => setActiveQuickAction((v) => (v === 'approve-vendors' ? null : 'approve-vendors'))}
                className={`w-full h-16 text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 flex items-center justify-center gap-2 text-white rounded-lg ${activeQuickAction === 'approve-vendors' ? 'ring-2 ring-cyan-500' : ''}`}
              >
                <Store className="w-5 h-5" />
                Approve Vendors
              </button>

              <button
                onClick={() => setActiveQuickAction((v) => (v === 'create-gym-session' ? null : 'create-gym-session'))}
                className={`w-full h-16 text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 flex items-center justify-center gap-2 text-white rounded-lg ${activeQuickAction === 'create-gym-session' ? 'ring-2 ring-cyan-500' : ''}`}
              >
                <Dumbbell className="w-5 h-5" />
                Create Gym Session
              </button>
            </div>
          </CardContent>
        </Card>
        {/* Conditional quick-action content */}
        <div className="max-w-7xl mx-auto px-6 py-2">
          {activeQuickAction === 'create-event' && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <EventFormPage />
            </div>
          )}

          {activeQuickAction === 'approve-vendors' && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <ApprovedEvents />
            </div>
          )}

          {activeQuickAction === 'create-gym-session' && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <CreateGymSession />
            </div>
          )}
        </div>
        <EventOfficerAnalytics />
      </div>
    </DashboardLayout>
  );
}

export default EventOfficerDashboard;

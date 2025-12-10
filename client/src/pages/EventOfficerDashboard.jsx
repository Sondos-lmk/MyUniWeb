import { useAuth } from "../context/AuthContext";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UpcomingEvents from "../components/UpcomingEvents.jsx";
import AttendeesReport from "../components/AttendeesReport";
import RevenueReport from "../components/RevenueReport";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Dumbbell, Store, Archive, GraduationCap, ArrowLeft, ChevronDown, Users, ClipboardList, MessageSquare, ListChecks, FileText, Folder, ShoppingBag } from "lucide-react";
import AvailableBooths from "./AvailableBooths";
import VendorRequestsAdmin from "../components/VendorRequestsAdmin";
import EventFormPage from "../components/EventFormPage";
import ApprovedEvents from "../components/ApprovingEvents";
import CreateGymSession from "./CreateGymSession";
import EventOfficerAnalytics from "../components/EventOfficerAnalytics";
import EventOfficerChatbot from "../components/EventOfficerChatbot.jsx";


function EventOfficerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = React.useState('overview');
  const [activeQuickAction, setActiveQuickAction] = React.useState(null);

  // Collapsible Reports state
  //const [reportsOpen, setReportsOpen] = React.useState(false);
  //const [selectedReport, setSelectedReport] = React.useState('attendees');

  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState("attendees");

const sidebarItems = [
    { to: "/eventOfficer/dashboard", label: "Overview", icon: GraduationCap },
    { to: "/eventOfficer/approveWorkshops", label: "Workshops", icon: ListChecks },
    { to: "/eventOfficer/all-events", label: "All Events", icon: ClipboardList },
    { to: '/eventOfficer/available-booths', label: 'Available Booths', icon: ShoppingBag },
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


  return (
    <DashboardLayout dashboardTitle="Event Officer Dashboard" roleLabel="Events Officer" roleColor="bg-blue-600" sidebarItems={sidebarItems} activeKey={activeSection} extraSidebarProps={{ isReportsOpen, selectedReport }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <>
            <EventOfficerChatbot onNavigate={(page) => {
              console.log("Chatbot navigating to page:", page);
              navigate(page);
            }} />
            {/* Quick Actions */}
            <Card className="mb-8 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveQuickAction((v) => (v === 'create-event' ? null : 'create-event'))}
                    className={`w-full h-16 text-sm font-medium bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 text-white rounded-lg transition-colors ${activeQuickAction === 'create-event' ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <Calendar className="w-5 h-5" />
                    Create Event
                  </button>

                  <button
                    onClick={() => setActiveQuickAction((v) => (v === 'approve-vendors' ? null : 'approve-vendors'))}
                    className={`w-full h-16 text-sm font-medium bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 text-white rounded-lg transition-colors ${activeQuickAction === 'approve-vendors' ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <Store className="w-5 h-5" />
                    Approve Vendors
                  </button>

                  <button
                    onClick={() => setActiveQuickAction((v) => (v === 'create-gym-session' ? null : 'create-gym-session'))}
                    className={`w-full h-16 text-sm font-medium bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 text-white rounded-lg transition-colors ${activeQuickAction === 'create-gym-session' ? 'ring-2 ring-blue-500' : ''}`}
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default EventOfficerDashboard;

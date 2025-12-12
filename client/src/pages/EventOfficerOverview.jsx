import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import DashboardLayout from "../components/DashboardLayout";
import EventOfficerAnalytics from "../components/EventOfficerAnalytics";
import { Calendar, GraduationCap, Dumbbell, Store, ClipboardList, Archive, FileText, Users, Folder, ShoppingBag } from "lucide-react";
import EventOfficerChatbot from "../components/EventOfficerChatbot.jsx";

export default function EventOfficerOverview() {
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState("attendees");
  const navigate = useNavigate();

  const quickActionClasses =
    "w-full h-16 text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 flex items-center justify-center gap-2 text-white rounded-lg";

  const sidebarItems = [
    { to: '/eventOfficer/dashboard', label: 'Overview', icon: GraduationCap },
    { to: '/eventOfficer/approveWorkshops', label: 'Workshops', icon: ClipboardList },
    { to: '/eventOfficer/all-events', label: 'All Events', icon: ClipboardList },
    { to: "/eventOfficer/club-requests", label: "Club Requests", icon: Users },
    { to: '/eventOfficer/available-booths', label: 'Available Booths', icon: ShoppingBag },
    { to: '/gym-schedule', label: 'Gym Schedule', icon: Dumbbell },
    { to: '/eventOfficer/loyalty-vendors', label: 'Loyalty Vendors', icon: Store },
    { to: '/eventOfficer/documents', label: 'View Documents', icon: Folder },
    {
      key: 'reports',
      label: 'Reports',
      icon: FileText,
      isCollapsible: true,
      isOpen: isReportsOpen,
      onToggle: () => setIsReportsOpen((s) => !s),
      subItems: [
        { label: 'Attendees Report', onClick: () => { setSelectedReport('attendees'); navigate('/eventOfficer/attendees-report'); setIsReportsOpen(true); } },
        { label: 'Revenue Report', onClick: () => { setSelectedReport('revenue'); navigate('/eventOfficer/revenue-report'); setIsReportsOpen(true); } },
      ]
    }
  ];

  return (
    <DashboardLayout dashboardTitle="Event Officer Dashboard" roleLabel="Events Officer" roleColor="bg-blue-600" sidebarItems={sidebarItems} extraSidebarProps={{ isReportsOpen, selectedReport }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <EventOfficerChatbot onNavigate={(page) => navigate(page)} />
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/create-event">
                <Button type="button" className={quickActionClasses}>
                  <Calendar className="w-5 h-5" />
                  Create Event
                </Button>
              </Link>
              <Link to="/approved-events">
                <Button type="button" className={quickActionClasses}>
                  <Store className="w-5 h-5" />
                  Approve Vendors
                </Button>
              </Link>
              <Link to="/create-gym-session">
                <Button type="button" className={quickActionClasses}>
                  <Dumbbell className="w-5 h-5" />
                  Create Gym Session
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <EventOfficerAnalytics />
      </div>
    </DashboardLayout>
  );
}

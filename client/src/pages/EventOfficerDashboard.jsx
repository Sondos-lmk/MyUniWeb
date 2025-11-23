import { useAuth } from "../context/AuthContext";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UpcomingEvents from "../components/UpcomingEvents.jsx";
import AttendeesReport from "../components/AttendeesReport";
import RevenueReport from "../components/RevenueReport";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Dumbbell, Store, Archive, GraduationCap, ArrowLeft } from "lucide-react";

import { ChevronDown, Users, ClipboardList, MessageSquare, ListChecks } from "lucide-react";

function EventOfficerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Collapsible Reports state
  const [reportsOpen, setReportsOpen] = React.useState(false);

  const sidebarItems = [
    { to: "/eventOfficer/dashboard", label: "Overview", icon: GraduationCap },
    { to: "/eventOfficer/approveWorkshops", label: "Workshops", icon: ListChecks },
    { to: "/eventOfficer/all-events", label: "All Events", icon: ClipboardList },
    { to: "/gym-schedule", label: "Gym Schedule", icon: Dumbbell },
    { to: "/events/upcoming", label: "Upcoming Events", icon: Calendar },
    { to: "/eventOfficer/all-comments", label: "View All Comments", icon: MessageSquare },
    { to: "/eventOfficer/archived-events", label: "Archived Events", icon: Archive },
    { to: "/loyalty-vendors", label: "Loyalty Vendors", icon: Store },
    // Collapsible Reports group
    {
      label: "Reports",
      icon: ChevronDown,
      key: "reports",
      isCollapsible: true,
      open: reportsOpen,
      onClick: () => setReportsOpen((v) => !v),
      children: [
        { to: "/eventOfficer/attendees-report", label: "Attendees", icon: Users },
        { to: "/eventOfficer/revenue-report", label: "Revenue", icon: ClipboardList },
      ],
    },
  ];

  return (
    <DashboardLayout dashboardTitle="Event Officer Dashboard" roleLabel="Events Officer" roleColor="bg-cyan-600" sidebarItems={sidebarItems}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions Only (Overview) */}

        {/* Quick Actions */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/create-event">
                <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white">
                  <Calendar className="w-6 h-6" />
                  <span>Create Event</span>
                </Button>
              </Link>
              <Link to="/approved-events">
                <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white">
                  <Store className="w-6 h-6" />
                  <span>Approve Vendors</span>
                </Button>
              </Link>
              <Link to="/create-gym-session">
                <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white">
                  <Dumbbell className="w-6 h-6" />
                  <span>Create Gym Session</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default EventOfficerDashboard;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import DashboardLayout from "../components/DashboardLayout";
import { Calendar, GraduationCap, Dumbbell, Store, ClipboardList, Archive, FileText, Users, Folder } from "lucide-react";

export default function EventOfficerOverview() {
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState("attendees");
  const navigate = useNavigate();

  const sidebarItems = [
    { to: '/eventOfficer/dashboard', label: 'Overview', icon: GraduationCap },
    { to: '/eventOfficer/approveWorkshops', label: 'Workshops', icon: ClipboardList },
    { to: '/eventOfficer/all-events', label: 'All Events', icon: ClipboardList },
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
    <DashboardLayout dashboardTitle="Event Officer Dashboard" roleLabel="Events Officer" roleColor="bg-cyan-600" sidebarItems={sidebarItems} extraSidebarProps={{ isReportsOpen, selectedReport }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
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

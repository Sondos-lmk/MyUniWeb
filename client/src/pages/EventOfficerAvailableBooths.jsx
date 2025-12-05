import AvailableBooths from "./AvailableBooths";
import DashboardLayout from "../components/DashboardLayout";
import { GraduationCap, ListChecks, ClipboardList, ShoppingBag, Dumbbell, Store, Folder, FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EventOfficerChatbot from "../components/EventOfficerChatbot.jsx";


function EventOfficerAvailableBooths() {
  const navigate = useNavigate();
  const [reportsOpen, setReportsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState('attendees');

  const sidebarItems = [
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
      isOpen: reportsOpen,
      onToggle: () => setReportsOpen((v) => !v),
      subItems: [
        { label: "Attendees Report", onClick: () => { setSelectedReport('attendees'); navigate('/eventOfficer/attendees-report'); setReportsOpen(true); } },
        { label: "Revenue Report", onClick: () => { setSelectedReport('revenue'); navigate('/eventOfficer/revenue-report'); setReportsOpen(true); } },
      ],
    },
  ];

  return (
    <DashboardLayout 
      dashboardTitle="Event Officer Dashboard" 
      roleLabel="Events Officer" 
      roleColor="bg-blue-600" 
      sidebarItems={sidebarItems} 
      extraSidebarProps={{ isReportsOpen: reportsOpen, selectedReport }}
    >
      <EventOfficerChatbot />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AvailableBooths showActions={true} />
      </div>
    </DashboardLayout>
  );
}

export default EventOfficerAvailableBooths;

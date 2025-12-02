import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ApprovedEvents from '../components/ApprovingEvents';
import { ListChecks,GraduationCap, ClipboardList, Dumbbell, Calendar, Archive, Store, Users, Clipboard, FileText, Folder, ShoppingBag } from 'lucide-react';

export default function EventOfficerApproveVendors() {
  const navigate = useNavigate();
  const [isReportsOpen, setIsReportsOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState('attendees');

  const sidebarItems = [
    { to: '/eventOfficer/dashboard', label: 'Overview', icon: GraduationCap },
    { to: '/eventOfficer/approveWorkshops', label: 'Workshops', icon: ListChecks },
    { to: '/eventOfficer/all-events', label: 'All Events', icon: ClipboardList },
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
      ],
    },
  ];

  return (
    <DashboardLayout dashboardTitle="Event Officer Dashboard" roleLabel="Events Officer" roleColor="bg-blue-600" sidebarItems={sidebarItems} extraSidebarProps={{ isReportsOpen, selectedReport }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ApprovedEvents />
      </div>
    </DashboardLayout>
  );
}

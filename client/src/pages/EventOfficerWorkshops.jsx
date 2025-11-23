import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ApproveWorkshops from '../components/ApproveWorkshops';
import { ListChecks, ClipboardList, Dumbbell, Calendar, MessageSquare, Archive, Store, Users, Clipboard } from 'lucide-react';

export default function EventOfficerWorkshops() {
  const sidebarItems = [
    { to: '/eventOfficer/dashboard', label: 'Overview', icon: ListChecks },
    { to: '/eventOfficer/approveWorkshops', label: 'Workshops', icon: ListChecks },
    { to: '/eventOfficer/all-events', label: 'All Events', icon: ClipboardList },
    { to: '/gym-schedule', label: 'Gym Schedule', icon: Dumbbell },
    { to: '/events/upcoming', label: 'Upcoming Events', icon: Calendar },
    { to: '/eventOfficer/all-comments', label: 'View All Comments', icon: MessageSquare },
    { to: '/eventOfficer/archived-events', label: 'Archived Events', icon: Archive },
    { to: '/loyalty-vendors', label: 'Loyalty Vendors', icon: Store },
    { to: '/eventOfficer/attendees-report', label: 'Attendees Report', icon: Users },
    { to: '/eventOfficer/revenue-report', label: 'Revenue Report', icon: Clipboard },
  ];

  return (
    <DashboardLayout dashboardTitle="Event Officer Dashboard" roleLabel="Events Officer" roleColor="bg-cyan-600" sidebarItems={sidebarItems}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ApproveWorkshops />
      </div>
    </DashboardLayout>
  );
}

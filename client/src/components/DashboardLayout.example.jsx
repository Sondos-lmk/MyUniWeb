/**
 * Example usage of DashboardLayout component for different roles
 * 
 * This file shows how to use the DashboardLayout component for:
 * - Student Dashboard
 * - Staff Dashboard
 * - Events Officer Dashboard
 * - TA Dashboard
 * - Professor Dashboard
 * - Admin Dashboard
 */

import DashboardLayout from './DashboardLayout';
import { 
  Calendar, 
  CheckCircle, 
  Star, 
  Home, 
  Trophy, 
  Dumbbell, 
  Store,
  ShoppingBag,
  Users,
  FileText,
  MessageSquare,
  Plus,
  FileCheck
} from 'lucide-react';

// ============================================
// STUDENT DASHBOARD EXAMPLE
// ============================================
export function StudentDashboardExample() {
  const sidebarItems = [
    { to: '/student/upcoming-events', label: 'Upcoming Events', icon: Calendar },
    { to: '/student/my-events', label: 'My Registered Events', icon: CheckCircle },
    { to: '/student/favorites', label: 'Favorites', icon: Star },
    { to: '/student/register', label: 'Register for Event', icon: Home },
    { to: '/student/courts', label: 'View Courts', icon: Trophy },
    { to: '/student/gym', label: 'Gym Schedule', icon: Dumbbell },
    { to: '/student/vendors', label: 'Loyalty Vendors', icon: Store },
  ];

  return (
    <DashboardLayout
      dashboardTitle="Student Dashboard"
      roleLabel="Verified Student"
      roleColor="bg-green-500"
      sidebarItems={sidebarItems}
    >
      {/* Your student dashboard content here */}
      <div>Student Dashboard Content</div>
    </DashboardLayout>
  );
}

// ============================================
// STAFF DASHBOARD EXAMPLE
// ============================================
export function StaffDashboardExample() {
  const sidebarItems = [
    { to: '/staff/upcoming-events', label: 'Upcoming Events', icon: Calendar },
    { to: '/staff/my-events', label: 'My Registered Events', icon: CheckCircle },
    { to: '/staff/favorites', label: 'Favorites', icon: Star },
  ];

  return (
    <DashboardLayout
      dashboardTitle="Staff Dashboard"
      roleLabel="Staff Member"
      roleColor="bg-blue-500"
      sidebarItems={sidebarItems}
    >
      {/* Your staff dashboard content here */}
      <div>Staff Dashboard Content</div>
    </DashboardLayout>
  );
}

// ============================================
// EVENTS OFFICER DASHBOARD EXAMPLE
// ============================================
export function EventsOfficerDashboardExample() {
  const sidebarItems = [
    { to: '/eventOfficer/vendor-requests', label: 'Vendor Requests', icon: FileCheck },
    { to: '/eventOfficer/events', label: 'All Events', icon: Calendar },
    { to: '/eventOfficer/create-event', label: 'Create Event', icon: Plus },
    { to: '/eventOfficer/approve-workshops', label: 'Approve Workshops', icon: FileCheck },
    { to: '/eventOfficer/documents', label: 'View Documents', icon: FileText },
  ];

  return (
    <DashboardLayout
      dashboardTitle="Events Officer Dashboard"
      roleLabel="Events Officer"
      roleColor="bg-purple-500"
      sidebarItems={sidebarItems}
    >
      {/* Your events officer dashboard content here */}
      <div>Events Officer Dashboard Content</div>
    </DashboardLayout>
  );
}

// ============================================
// TA DASHBOARD EXAMPLE
// ============================================
export function TADashboardExample() {
  const sidebarItems = [
    { to: '/ta/upcoming-events', label: 'Upcoming Events', icon: Calendar },
    { to: '/ta/my-events', label: 'My Registered Events', icon: CheckCircle },
  ];

  return (
    <DashboardLayout
      dashboardTitle="TA Dashboard"
      roleLabel="Teaching Assistant"
      roleColor="bg-indigo-500"
      sidebarItems={sidebarItems}
    >
      {/* Your TA dashboard content here */}
      <div>TA Dashboard Content</div>
    </DashboardLayout>
  );
}

// ============================================
// PROFESSOR DASHBOARD EXAMPLE
// ============================================
export function ProfessorDashboardExample() {
  const sidebarItems = [
    { to: '/professor/upcoming-events', label: 'Upcoming Events', icon: Calendar },
    { to: '/professor/my-workshops', label: 'My Workshops', icon: FileText },
    { to: '/professor/create-workshop', label: 'Create Workshop', icon: Plus },
  ];

  return (
    <DashboardLayout
      dashboardTitle="Professor Dashboard"
      roleLabel="Professor"
      roleColor="bg-orange-500"
      sidebarItems={sidebarItems}
    >
      {/* Your professor dashboard content here */}
      <div>Professor Dashboard Content</div>
    </DashboardLayout>
  );
}

// ============================================
// ADMIN DASHBOARD EXAMPLE
// ============================================
export function AdminDashboardExample() {
  const sidebarItems = [
    { to: '/admin/vendor-requests', label: 'Vendor Requests', icon: ShoppingBag },
    { to: '/admin/all-events', label: 'All Events', icon: Calendar },
    { to: '/admin/all-users', label: 'All Users', icon: Users },
    { to: '/admin/all-comments', label: 'All Comments', icon: MessageSquare },
    { to: '/admin/documents', label: 'View Documents', icon: FileText },
  ];

  return (
    <DashboardLayout
      dashboardTitle="Admin Dashboard"
      roleLabel="Administrator"
      roleColor="bg-red-500"
      sidebarItems={sidebarItems}
    >
      {/* Your admin dashboard content here */}
      <div>Admin Dashboard Content</div>
    </DashboardLayout>
  );
}


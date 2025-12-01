import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminUpcomingEventsGrid from "../components/AdminUpcomingEventsGrid";
import ManageAdminsOfficers from "./ManageAdminsOfficers";
import ManagePendingUsers from "./ManagePendingUsers";
import CreateAdminOfficer from "./CreateAdminOfficer";
import ManageVendorRequests from "./ManageVendorRequests";
import ManageAllComments from "./ManageAllComments";
import ViewDocuments from "./ViewDocuments";
import LoyaltyVendors from "./LoyaltyVendors";
import AttendeesReport from "../components/AttendeesReport";
import RevenueReport from "../components/RevenueReport";
import DashboardLayout from "../components/DashboardLayout";
import AllUsers from "./AllUsers";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  UserPlus, 
  Users, 
  UserCheck, 
  GraduationCap, 
  BarChart3, 
  FileText,
  ChevronDown,
  ChevronRight,
  Package,
  MessageSquare,
  Store,
  Folder,
  ShoppingBag
} from "lucide-react";
import AvailableBooths from "./AvailableBooths";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { startOfDay, endOfDay, isAfter, format } from "date-fns";
const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initialTabFromLocation = location.state?.initialTab;

  const [activeQuickAction, setActiveQuickAction] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState(initialTabFromLocation || "overview");
  const [isReportsOpen, setIsReportsOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState("attendees");

  // LIVE STATS — same look as your old hardcoded one
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    eventsToday: 0,
    activeEvents: 0,
    loading: true
  });

  useEffect(() => {
    if (initialTabFromLocation) {
      setActiveTab(initialTabFromLocation);
      // Don't clear the state immediately, let it apply first
      setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 0);
    }
  }, [initialTabFromLocation, navigate, location.pathname]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);

        const [usersRes, eventsRes] = await Promise.all([
          API.get("/admin/users"),
          API.get("/events")
        ]);

        const users = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data?.data || usersRes.data?.users || [];

        // Support both { events: [...] } and direct array
        let events = Array.isArray(eventsRes.data)
          ? eventsRes.data
          : eventsRes.data?.events || eventsRes.data?.data || [];

        // Normalize event dates
        events = events.map(event => {
          // Some events use 'date' for single-day, some use 'startDate'/'endDate'
          let start = event.startDate || event.date;
          let end = event.endDate || event.date;
          return {
            ...event,
            _start: start ? new Date(start) : null,
            _end: end ? new Date(end) : null
          };
        });

        const totalUsers = users.filter(u => u.isVerified && u.isActive).length;
        const pendingUsers = users.filter(u => !u.isVerified).length;

        const eventsToday = events.filter(event => {
          if (event.status !== "approved" || event.isArchived) return false;
          if (!event._start || !event._end) return false;
          return event._start <= todayEnd && event._end >= todayStart;
        }).length;

        const activeEvents = events.filter(event => {
          if (event.status !== "approved" || event.isArchived) return false;
          if (!event._end) return false;
          return isAfter(event._end, today) || format(event._end, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
        }).length;

        setStats({ totalUsers, pendingUsers, eventsToday, activeEvents, loading: false });
      } catch (err) {
        setStats({ totalUsers: 0, pendingUsers: 0, eventsToday: 0, activeEvents: 0, loading: false });
      }
    };
    fetchStats();
  }, []);

  const sidebarItems = [
    { key: "overview", label: "Overview", icon: GraduationCap, onClick: () => setActiveTab("overview") },
    { key: "upcoming", label: "Upcoming Events", icon: BarChart3, onClick: () => setActiveTab("upcoming") },
    { key: "allComments", label: "Events Reviews", icon: MessageSquare, onClick: () => setActiveTab("allComments") },
    { key: "availableBooths", label: "Available Booths", icon: ShoppingBag, onClick: () => setActiveTab("availableBooths") },
    { key: "vendorRequests", label: "Vendor Requests", icon: Package, onClick: () => setActiveTab("vendorRequests") },
    { key: "loyaltyVendors", label: "Loyalty Vendors", icon: Store, onClick: () => setActiveTab("loyaltyVendors") },
    { key: "documents", label: "View Documents", icon: Folder, onClick: () => setActiveTab("documents") },
    { key: "users", label: "All Users", icon: Users, onClick: () => setActiveTab("users") },
    {
      key: "reports",
      label: "Reports",
      icon: FileText,
      isCollapsible: true,
      isOpen: isReportsOpen,
      onToggle: () => setIsReportsOpen(!isReportsOpen),
      subItems: [
        { label: "Attendees Report", onClick: () => { setSelectedReport("attendees"); setActiveTab("reports"); setIsReportsOpen(true); } },
        { label: "Revenue Report",   onClick: () => { setSelectedReport("revenue");   setActiveTab("reports"); setIsReportsOpen(true); } },
      ]
    },
  ];

  return (
    <DashboardLayout
      dashboardTitle="Admin Dashboard"
      roleLabel="Administrator"
      roleColor="bg-indigo-600"
      sidebarItems={sidebarItems}
      activeKey={activeTab}
      extraSidebarProps={{ isReportsOpen, selectedReport }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Overview — EXACT SAME LOOK AS YOU HAD */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    className={`w-full h-16 text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 ${activeQuickAction === 'create-admin-officer' ? 'ring-2 ring-cyan-500' : ''}`}
                    onClick={() => setActiveQuickAction('create-admin-officer')}
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Admin/Officer
                  </Button>
                  <Button
                    className={`w-full h-16 text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 ${activeQuickAction === 'manage-admins' ? 'ring-2 ring-cyan-500' : ''}`}
                    onClick={() => setActiveQuickAction('manage-admins')}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Manage Admins/Officers
                  </Button>
                  <Button
                    className={`w-full h-16 text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 ${activeQuickAction === 'pending-users' ? 'ring-2 ring-cyan-500' : ''}`}
                    onClick={() => setActiveQuickAction('pending-users')}
                  >
                    <UserCheck className="w-5 h-5 mr-2" />
                    Pending Users
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Your quick action components */}
            <div className="mt-8">
              {activeQuickAction === 'create-admin-officer' && <CreateAdminOfficer />}
              {activeQuickAction === 'manage-admins' && <ManageAdminsOfficers />}
              {activeQuickAction === 'pending-users' && <ManagePendingUsers />}
            </div>

            {/* SAME EXACT STATISTICS CARD YOU HAD — now with real numbers */}
            <Card className="max-w-2xl mx-auto shadow-xl mt-8">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.loading ? (
                  <p className="text-center py-8 text-gray-500">Loading...</p>
                ) : (
                  <table className="w-full text-left">
                    <tbody className="text-lg">
                      <tr className="border-b"><td className="py-4 font-semibold">Total Users</td><td className="text-right font-bold bg-gradient-to-r from-cyan-600 to-blue-700 text-transparent bg-clip-text">{stats.totalUsers.toLocaleString()}</td></tr>
                      <tr className="border-b"><td className="py-4 font-semibold">Pending Users</td><td className="text-right font-bold bg-gradient-to-r from-cyan-600 to-blue-700 text-transparent bg-clip-text">{stats.pendingUsers}</td></tr>
                      <tr className="border-b"><td className="py-4 font-semibold">Events Today</td><td className="text-right font-bold bg-gradient-to-r from-cyan-600 to-blue-700 text-transparent bg-clip-text">{stats.eventsToday}</td></tr>
                      <tr className="border-b"><td className="py-4 font-semibold">Active Events</td><td className="text-right font-bold bg-gradient-to-r from-cyan-600 to-blue-700 text-transparent bg-clip-text">{stats.activeEvents}</td></tr>
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "upcoming" && <AdminUpcomingEventsGrid />}
        {activeTab === "availableBooths" && <div className="mt-8"><AvailableBooths showActions={false} /></div>}
        {activeTab === "users" && <div className="mt-8"><AllUsers /></div>}
        {activeTab === "vendorRequests" && <div className="mt-8"><ManageVendorRequests /></div>}
        {activeTab === "allComments" && <div className="mt-8"><ManageAllComments /></div>}
          {activeTab === "loyaltyVendors" && <div className="mt-8"><LoyaltyVendors /></div>}
        {activeTab === "documents" && <div className="mt-8"><ViewDocuments /></div>}
        {activeTab === "reports" && (
          <div className="mt-8 space-y-6">
            {selectedReport === "attendees" ? <AttendeesReport /> : <RevenueReport />}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
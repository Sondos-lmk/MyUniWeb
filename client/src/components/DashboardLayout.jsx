import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { 
  LogOut, 
  Wallet
} from 'lucide-react';

/**
 * DashboardLayout - Reusable layout component for all roles
 * @param {Object} props
 * @param {React.ReactNode} props.children - Main content to render
 * @param {Array} props.sidebarItems - Array of sidebar navigation items
 * @param {string} props.dashboardTitle - Title to display in the header (e.g., "Student Dashboard")
 * @param {string} props.roleLabel - Label for the user's role (e.g., "Verified Student")
 * @param {string} props.roleColor - Color class for the role badge (e.g., "bg-green-500")
 * @param {string} props.activeKey - Key to identify which sidebar item is active (for onClick items)
 */
export default function DashboardLayout({ 
  children, 
  sidebarItems = [], 
  dashboardTitle = "Dashboard",
  roleLabel = null,
  roleColor = "bg-green-500",
  activeKey = null
}) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const active = (path) =>
    location.pathname === path || location.pathname.startsWith(path)
      ? "text-cyan-600 font-semibold bg-cyan-50"
      : "text-slate-700 hover:text-cyan-600 hover:bg-cyan-50";

  const handleLogout = () => {
    logout();
  };

  // Get user's initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Get user's full name or fallback
  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userRole = user?.role || localStorage.getItem('role') || '';
  
  // Default role labels if not provided
  const defaultRoleLabels = {
    student: 'Verified Student',
    staff: 'Staff Member',
    eventOfficer: 'Events Officer',
    ta: 'Teaching Assistant',
    professor: 'Professor',
    admin: 'Administrator',
    vendor: 'Vendor'
  };
  
  const displayRoleLabel = roleLabel || defaultRoleLabels[userRole] || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100">
      {/* Sidebar - Always Visible */}
      <aside className="fixed top-0 left-0 h-screen w-72 bg-white shadow-lg z-30 border-r border-slate-200">
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Innovex
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {/* 🔹 Static Upcoming Events button for professors */}
  {userRole === "professor" && (
    <Link
      to="/professor/upcoming-events"
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active(
        "/professor/upcoming-events"
      )}`}
    >
      <span>Upcoming Events</span>
    </Link>
  )}
              {sidebarItems.map((item, index) => {
                // Support both Link components and regular buttons
                if (item.to) {
                  return (
                    <Link
                      key={index}
                      to={item.to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active(item.to)}`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span>{item.label}</span>
                    </Link>
                  );
                } else if (item.onClick) {
                  const isActive = activeKey && item.key === activeKey;
                  return (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
                        isActive 
                          ? "text-cyan-600 font-semibold bg-cyan-50" 
                          : "text-slate-700 hover:text-cyan-600 hover:bg-cyan-50"
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span>{item.label}</span>
                    </button>
                  );
                }
                return null;
              })}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area - Offset by sidebar width */}
      <div className="ml-72 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
          <div className="px-6 h-16 flex items-center justify-between">
            {/* Left: Logo (optional, since sidebar has it) */}
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent select-none">
                {dashboardTitle}
              </span>
            </div>

            {/* Right: Notifications + Wallet (if applicable) + Logout */}
            <div className="flex items-center gap-3">
              {user && userRole !== "vendor" && <NotificationBell />}
              
              {/* Wallet button - can be conditionally shown based on role */}
              {user && (['student', 'staff', 'ta', 'professor'].includes(userRole)) && (
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-sm font-medium hover:from-cyan-700 hover:to-blue-800 transition-colors"
                  title="Wallet"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">$150.50</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 w-full">
          <div className="max-w-full px-6 py-8">
            {/* Welcome Header Section - Left Aligned */}
            <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                {/* Profile Picture/Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-600 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(userName)
                  )}
                </div>

                {/* Welcome Message and User Info - Left Aligned */}
                <div>
                  <p className="text-gray-600 text-lg mb-1">
                    Welcome to your dashboard!
                  </p>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    {userName}
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white ${roleColor}`}>
                    {displayRoleLabel} ✓
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Title */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                {dashboardTitle}
              </h2>
            </div>

            {/* Main Content */}
            <div className="w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


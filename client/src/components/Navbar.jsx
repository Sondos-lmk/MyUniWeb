// client/src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { useState } from "react";
import { Menu, X, Bell, LogOut, Calendar, FileCheck, FileText, Plus, ArrowLeft, Users, MessageSquare, ShoppingBag } from "lucide-react";

export default function Navbar({ showBackButton = false }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const active = (path) =>
    pathname.startsWith(path)
      ? "text-cyan-600 font-semibold bg-cyan-50"
      : "text-slate-700 hover:text-cyan-600 hover:bg-cyan-50";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
    setSidebarOpen(false);
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          {/* Left: Back Button + Hamburger + Logo */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6 text-cyan-600" />
              </button>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent select-none cursor-default">
              Innovex
            </span>
          </div>

          {/* Right: Notifications + Logout */}
          <div className="flex items-center gap-3">
            {token && role !== "vendor" && <NotificationBell />}
            
            {!token ? (
              <Link
                to="/"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-sm font-medium hover:from-cyan-700 hover:to-blue-800 transition-all"
              >
                Log in
              </Link>
            ) : (
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Menu
            </span>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {token && (
                <>
                  {/* Admin Only Links */}
                  {role === "admin" && (
                    <>
                      <Link
                        to="/admin/vendor-requests"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active("/admin/vendor-requests")}`}
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span>Vendor Requests</span>
                      </Link>

                      <Link
                        to="/admin/all-events"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active("/admin/all-events")}`}
                      >
                        <Calendar className="w-5 h-5" />
                        <span>All Events</span>
                      </Link>

                      <Link
                        to="/admin/all-users"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active("/admin/all-users")}`}
                      >
                        <Users className="w-5 h-5" />
                        <span>All Users</span>
                      </Link>

                      <Link
                        to="/admin/all-comments"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active("/admin/all-comments")}`}
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>All Comments</span>
                      </Link>

                      <Link
                        to="/admin/documents"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active("/admin/documents")}`}
                      >
                        <FileText className="w-5 h-5" />
                        <span>View Documents</span>
                      </Link>
                    </>
                  )}

                  {/* Event Officer Only Links */}
                  {role === "eventOfficer" && (
                    <>
                      <Link
                        to="/approved-events"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active("/approved-events")}`}
                      >
                        <FileCheck className="w-5 h-5" />
                        <span>Vendor Requests</span>
                      </Link>

                      <Link
                        to="/events"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active("/events")}`}
                      >
                        <Calendar className="w-5 h-5" />
                        <span>All Events</span>
                      </Link>

                      <Link
                        to="/create-event"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active("/create-event")}`}
                      >
                        <Plus className="w-5 h-5" />
                        <span>Create Event</span>
                      </Link>

                      <Link
                        to="/eventOfficer/approveWorkshops"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active("/eventOfficer/approveWorkshops")}`}
                      >
                        <FileCheck className="w-5 h-5" />
                        <span>Approve Workshops</span>
                      </Link>

                      <Link
                        to="/eventOfficer/documents"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active("/eventOfficer/documents")}`}
                      >
                        <FileText className="w-5 h-5" />
                        <span>View Documents</span>
                      </Link>
                    </>
                  )}
                </>
              )}

              {!token && (
                <Link
                  to="/signup-selection"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Sign Up</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}

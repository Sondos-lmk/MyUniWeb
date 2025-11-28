import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, Wallet, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function DashboardLayout({ 
  children, 
  sidebarItems = [], 
  dashboardTitle = "Dashboard",
  roleLabel = null,
  roleColor = "bg-green-500",
  activeKey = null,
  extraSidebarProps = {} 
}) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const active = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
      ? "text-cyan-600 font-semibold bg-cyan-50"
      : "text-slate-700 hover:text-cyan-600 hover:bg-cyan-50";

  const handleLogout = () => logout();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userRole = user?.role || localStorage.getItem('role') || '';
  
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
  const shouldShowWallet = user && ['student', 'staff', 'ta', 'professor'].includes(userRole);

  useEffect(() => {
    if (!shouldShowWallet) return;

    let isActive = true;
    setWalletLoading(true);

    api
      .get('/payment/wallet')
      .then((res) => {
        if (!isActive) return;
        const balanceValue = Number(res.data?.balance);
        setWalletBalance(Number.isFinite(balanceValue) ? balanceValue : 0);
      })
      .catch((err) => {
        console.error('Failed to load wallet balance:', err);
        if (isActive) setWalletBalance(null);
      })
      .finally(() => {
        if (isActive) setWalletLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [shouldShowWallet]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-72 bg-white shadow-lg z-30 border-r border-slate-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Innovex
            </span>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {sidebarItems.map((item, index) => {
                // SPECIAL CASE: Reports with dropdown
                if (item.key === "reports" && item.isCollapsible) {
                  const isReportsActive = activeKey === "reports";
                  const isOpen = extraSidebarProps.isReportsOpen || false;

                  return (
                    <div key={index} className="space-y-1">
                      {/* Main "Reports" button with arrow */}
                      <button
                        onClick={item.onToggle}
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
                          isReportsActive
                            ? "text-cyan-600 font-semibold bg-cyan-50"
                            : "text-slate-700 hover:text-cyan-600 hover:bg-cyan-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      {/* Dropdown items */}
                      {isOpen && (
                        <div className="ml-8 space-y-1 border-l-2 border-cyan-200">
                          {item.subItems?.map((sub, i) => {
                            const isSubActive = extraSidebarProps.selectedReport === 
                              (sub.label.includes("Attendees") ? "attendees" : "revenue");

                            return (
                              <button
                                key={i}
                                onClick={sub.onClick}
                                className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                                  isSubActive
                                    ? "text-cyan-600 font-medium bg-cyan-50"
                                    : "text-slate-600 hover:text-cyan-600 hover:bg-cyan-50"
                                }`}
                              >
                                {sub.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // ALL OTHER ITEMS (Overview, Users, Statistics, etc.) — unchanged
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

      {/* Main Content Area */}
      <div className="ml-72 min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent select-none">
                {dashboardTitle}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {user && userRole !== "vendor" && <NotificationBell />}
              
              {shouldShowWallet && (
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-sm font-medium hover:from-cyan-700 hover:to-blue-800 transition-colors">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {walletLoading
                      ? '...'
                      : walletBalance === null
                        ? 'N/A'
                        : `${walletBalance.toFixed(2)} EGP`}
                  </span>
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

        <div className="flex-1 w-full">
          <div className="max-w-full px-6 py-8">
            <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-600 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={userName} className="w-full h-full rounded-full object-cover" />
                  ) : getInitials(userName)}
                </div>
                <div>
                  <p className="text-gray-600 text-lg mb-1">Welcome back!</p>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">{userName}</h1>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white ${roleColor}`}>
                    {displayRoleLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
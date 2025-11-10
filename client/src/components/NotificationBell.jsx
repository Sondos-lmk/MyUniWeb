// client/src/components/NotificationBell.jsx
import React, { useState, useEffect } from "react";
import API from "../services/api";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearNotifications = async () => {
    try {
      await API.delete("/notifications/clear");
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full bg-gray-200 hover:bg-gray-300"
        title="Notifications"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5">
            {notifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center px-3 py-2 border-b">
            <h3 className="text-sm font-semibold text-gray-700">
              Notifications
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <p className="text-gray-500 text-sm p-3">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-gray-500 text-sm p-3">No new notifications.</p>
            ) : (
              notifications.map((msg, index) => (
                <div
                  key={index}
                  className="px-3 py-2 text-sm text-gray-800 border-b border-gray-100"
                >
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

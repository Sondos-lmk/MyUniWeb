import React, { useEffect, useState } from "react";
import API from "../services/api";
import ModernAlert from "../components/ui/ModernAlert";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 🔽 UPDATED: function to block/unblock user (now using isVerified)
  const handleBlockToggle = async (userId, isActive) => {
    try {
      const url = isActive
        ? `/admin/users/${userId}/block`
        : `/admin/users/${userId}/unblock`;

      await API.patch(url);
      showAlert(`User ${isActive ? "blocked" : "unblocked"} successfully`, "success");

      // Refresh user list
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error toggling user status:", error);
      showAlert("Something went wrong while updating user status.", "error");
    }
  };

  if (loading)
    return <div className="text-center mt-10 text-gray-600">Loading users...</div>;

  if (error)
    return (
      <div className="text-center mt-10 text-red-600 font-medium">
        {error}
      </div>
    );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">All Users</h1>
          <p className="text-gray-500 mt-2 text-sm">Manage roles, status and access controls</p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl ring-1 ring-gray-200 border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-3xl">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              Active Directory
            </h2>
            <div className="text-xs text-gray-400">Total: {users.length}</div>
          </div>

          <div className="overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar max-h-[560px]">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-gray-600 bg-gray-50/90">
                    <th className="font-semibold px-5 py-3 text-left">Name</th>
                    <th className="font-semibold px-5 py-3 text-left">Email</th>
                    <th className="font-semibold px-5 py-3 text-left">Role</th>
                    <th className="font-semibold px-5 py-3 text-left">Status</th>
                    <th className="font-semibold px-5 py-3 text-left">Created</th>
                    <th className="font-semibold px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u, idx) => {
                    const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
                    return (
                      <tr
                        key={u._id}
                        className={`${rowBg} group transition-colors duration-200 hover:bg-cyan-50 ${!u.isActive ? "opacity-60" : ""}`}
                      >
                        <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                              {u.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <span>{u.name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-700">{u.email}</td>
                        <td className="px-5 py-3 capitalize text-gray-600">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-indigo-500 to-cyan-600 text-white shadow-sm">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold shadow-sm ${
                              u.isActive
                                ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                                : "bg-red-100 text-red-700 ring-1 ring-red-200"
                            }`}
                          >
                            {u.isActive ? "Active" : "Blocked"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleBlockToggle(u._id, u.isActive)}
                            className={`relative inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg overflow-hidden transition-all shadow-sm ${
                              u.isActive
                                ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                                : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                            }`}
                          >
                            <span className="translate-y-px">{u.isActive ? "Block" : "Unblock"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Alert */}
      <ModernAlert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />
    </div>
  );
}

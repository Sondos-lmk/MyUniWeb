import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      alert(`User ${isActive ? "blocked" : "unblocked"} successfully`);

      // Refresh user list
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Something went wrong while updating user status.");
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
      <h1 className="text-3xl font-bold mb-6 text-center">All Users</h1>

      <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
        <table className="min-w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created At</th>
              {/* 🔽 NEW: Add column for actions */}
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              // 🔽 UPDATED: Gray out blocked users visually based on isVerified
              <tr
                key={u._id}
                className={`border-t hover:bg-gray-50 transition duration-150 ${
                  !u.isActive ? "opacity-60" : ""
                }`}
              >
                <td className="px-6 py-3">{u.name}</td>
                <td className="px-6 py-3">{u.email}</td>
                <td className="px-6 py-3 capitalize">{u.role}</td>

                {/* 🔽 UPDATED: show account status using isVerified */}
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      u.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.isActive ? "Active" : "Blocked"}
                  </span>
                </td>

                <td className="px-6 py-3">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>

                {/* 🔽 UPDATED: Block / Unblock button using isVerified */}
                <td className="px-6 py-3">
                  <button
                    onClick={() => handleBlockToggle(u._id, u.isActive)}
                    className={`px-3 py-1 rounded text-white ${
                      u.isActive
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {u.isActive ? "Block" : "Unblock"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

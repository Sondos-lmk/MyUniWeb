import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

export default function ManagePendingUsers() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
        const response = await axios.get(`${apiUrl}/api/admin/pending-users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingUsers(response.data);
      } catch (err) {
        console.error("Error fetching pending users:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    };
    fetchPendingUsers();
  }, [navigate]);

  const handleApprove = async (id, role) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      await axios.post(
        `${apiUrl}/api/admin/approve-user/${id}`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingUsers(pendingUsers.filter((user) => user._id !== id));
      alert("Verification email sent to user");
    } catch (err) {
      console.error("Error approving user:", err);
      alert(err.response?.data?.message || "Failed to approve user");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Pending Users</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="text-gray-500">No pending users.</p>
          ) : (
            <ul className="space-y-2">
              {pendingUsers.map((user) => (
                <li
                  key={user._id}
                  className="flex justify-between items-center border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">
                    {user.name} ({user.email}) - <span className="text-cyan-600">{user.role}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {user.role === 'student' ? (
                      <>
                        <span className="mr-2">Student</span>
                        <button
                          onClick={() => handleApprove(user._id, 'student')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                      </>
                    ) : (
                      <>
                        <select
                          value={selectedRoles[user._id] ?? user.role}
                          onChange={(e) =>
                            setSelectedRoles({ ...selectedRoles, [user._id]: e.target.value })
                          }
                          className="border border-gray-300 rounded-lg p-2"
                        >
                          <option value="staff">Staff</option>
                          <option value="ta">TA</option>
                          <option value="professor">Professor</option>
                        </select>
                        <button
                          onClick={() => handleApprove(user._id, selectedRoles[user._id] ?? user.role)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

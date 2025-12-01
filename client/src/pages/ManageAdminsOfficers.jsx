import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import ModernAlert from "../components/ui/ModernAlert";

export default function ManageAdminsOfficers() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");
  const [confirmAction, setConfirmAction] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const [adminResponse, eventOfficerResponse] = await Promise.all([
        axios.get(`${apiUrl}/api/admin/admins`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/api/admin/event-officers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const combinedUsers = [
        ...adminResponse.data,
        ...eventOfficerResponse.data,
      ];
      const uniqueUsers = Array.from(
        new Map(combinedUsers.map((user) => [user._id, user])).values()
      );
      setAdmins(uniqueUsers);
    } catch (err) {
      console.error("Error fetching admins/event officers:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDeleteUser = async (id, role) => {
    setConfirmAction({
      message: `Are you sure you want to delete this ${role}?`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            navigate("/");
            return;
          }
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
          await axios.delete(`${apiUrl}/api/admin/delete-user/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAdmins(admins.filter((user) => user._id !== id));
          showAlert(`${role} deleted successfully`, "success");
        } catch (err) {
          console.error("Error deleting user:", err);
          showAlert(err.response?.data?.message || `Failed to delete ${role}`, "error");
        }
        setConfirmAction(null);
      }
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Existing Admins and Event Officers</CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <p className="text-gray-500">No admins or event officers found.</p>
          ) : (
            <ul className="space-y-2">
              {admins.map((user) => (
                <li
                  key={user._id}
                  className="flex justify-between items-center border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">
                    {user.name} ({user.email}) - <span className="text-cyan-600">{user.role}</span>
                  </span>
                  <button
                    onClick={() => handleDeleteUser(user._id, user.role)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Modern Alert */}
      {alertMessage && (
        <ModernAlert
          message={alertMessage}
          type={alertType}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ModernAlert
          message={confirmAction.message}
          type="error"
          isConfirm={true}
          onConfirm={confirmAction.onConfirm}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

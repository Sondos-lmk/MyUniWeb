import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import UpcomingEvents from "../components/UpcomingEvents";
import AllUsers from "./AllUsers";

import ApprovingEvents from "../components/ApprovingEvents";
import AttendeesReport from "../components/AttendeesReport";
import NotificationBell from "../components/NotificationBell";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [admins, setAdmins] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const navigate = useNavigate();

  // Fetch pending users
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

  // Fetch existing admins and event officers
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
  }, [navigate]);

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await axios.get(`${apiUrl}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data.events || res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Delete event
  const handleDeleteEvent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await axios.delete(`${apiUrl}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(res.data.message || "Event deleted successfully!");
      setError("");
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(
        err.response?.data?.message ||
          "Cannot delete event. Maybe someone registered for it."
      );
    }
  };

  // Create Admin/Event Officer
  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!adminForm.role) {
      alert("Please select a role (admin or event officer)");
      return;
    }

    if (!adminForm.email.endsWith("@guc.edu.eg")) {
      alert("Email must end with @guc.edu.eg");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired. Please log in again.");
        navigate("/");
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const url = `${apiUrl}/api/admin/create/${adminForm.role}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to create user (Status: ${response.status})`
        );
      }

      alert(`Successfully created ${adminForm.role}: ${data.user.name}`);
      setAdminForm({ name: "", email: "", password: "", role: "" });
      fetchAdmins();
    } catch (error) {
      console.error("Error creating user:", error.message);
      alert(`Error creating user: ${error.message}`);
    }
  };

  // Delete user
  const handleDeleteUser = async (id, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
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
      alert(`${role} deleted successfully`);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(err.response?.data?.message || `Failed to delete ${role}`);
    }
  };

  // Approve user
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

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="p-6">
      {/* Header */}
    <div className="flex justify-between items-center mb-4">
  <h1 className="text-2xl font-bold">Admin Dashboard</h1>

  <div className="flex items-center gap-4">
    {/* 🔔 Show notifications for Admin too */}
    <NotificationBell />
    <Link
     to="/loyalty-vendors"
     className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
     >
     Loyalty Vendors
     </Link>

    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Logout
    </button>
  </div>
</div>

       
      {/* Attendees Report (shared component: shows only total attendees) */}
      <div className="mt-8 mb-8">
        <AttendeesReport />
      </div>

      {/* Create Admin/Event Officer */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Create Admin/Event Officer Account
        </h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block">Name</label>
            <input
              type="text"
              value={adminForm.name}
              onChange={(e) =>
                setAdminForm({ ...adminForm, name: e.target.value })
              }
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block">Email (must end with @guc.edu.eg)</label>
            <input
              type="email"
              value={adminForm.email}
              onChange={(e) =>
                setAdminForm({ ...adminForm, email: e.target.value })
              }
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block">Role</label>
            <select
              value={adminForm.role}
              onChange={(e) =>
                setAdminForm({ ...adminForm, role: e.target.value })
              }
              className="border p-2 w-full"
            >
              <option value="">Select a role</option>
              <option value="admin">Admin</option>
              <option value="eventOfficer">Event Officer</option>
            </select>
          </div>
          <div>
            <label className="block">Password</label>
            <input
              type="password"
              value={adminForm.password}
              onChange={(e) =>
                setAdminForm({ ...adminForm, password: e.target.value })
              }
              className="border p-2 w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Admin/Event Officer
          </button>
        </form>
      </div>

      {/* List Admins */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Existing Admins and Event Officers
        </h2>
        {admins.length === 0 ? (
          <p>No admins or event officers found.</p>
        ) : (
          <ul className="space-y-2">
            {admins.map((user) => (
              <li
                key={user._id}
                className="flex justify-between items-center border p-2"
              >
                <span>
                  {user.name} ({user.email}) - {user.role}
                </span>
                <button
                  onClick={() => handleDeleteUser(user._id, user.role)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pending Users */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Pending Users</h2>
        {pendingUsers.length === 0 ? (
          <p>No pending users.</p>
        ) : (
          <ul className="space-y-2">
            {pendingUsers.map((user) => (
              <li
                key={user._id}
                className="flex justify-between items-center border p-2"
              >
                <span>
                  {user.name} ({user.email}) - {user.role}
                </span>
                <div>
                  {/* If the pending user is a student, do not show role selector - admin cannot change student role */}
                  {user.role === 'student' ? (
                    <>
                      <span className="mr-4">Student</span>
                      <button
                        onClick={() => handleApprove(user._id, 'student')}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
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
                        className="border p-1 mr-2"
                      >
                        <option value="staff">Staff</option>
                        <option value="ta">TA</option>
                        <option value="professor">Professor</option>
                      </select>
                      <button
                        onClick={() => handleApprove(user._id, selectedRoles[user._id] ?? user.role)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
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
      </div>
      <div className="mt-10">
      <ApprovingEvents />
     </div>

      {/* Upcoming Events */}
      <div className="mt-10">
        <UpcomingEvents />
      </div>

      {/* Manage Events */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Manage Events</h2>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        {success && <p className="text-green-600 mb-3">{success}</p>}

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Location</th>
                  <th className="p-2 border">Start</th>
                  <th className="p-2 border">End</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id} className="text-center">
                    <td className="p-2 border">{event.title}</td>
                    <td className="p-2 border">{event.type}</td>
                    <td className="p-2 border">{event.location}</td>
                    <td className="p-2 border">
                      {new Date(event.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">
                      {new Date(event.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* All Users Table at the Bottom */}
        <div className="mt-12">
          <AllUsers />
        </div>
    </div>
  );
};

export default AdminDashboard;

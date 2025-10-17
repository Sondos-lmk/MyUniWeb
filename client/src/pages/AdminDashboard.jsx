import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UpcomingEvents from "../components/UpcomingEvents";


const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', role: '' });
  const [admins, setAdmins] = useState([]);
  const navigate = useNavigate();

  // Fetch pending users
  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const response = await axios.get(`${apiUrl}/api/admin/pending-users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingUsers(response.data);
      } catch (err) {
        console.error('Error fetching pending users:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      }
    };
    fetchPendingUsers();
  }, [navigate]);

  // Fetch existing admins and event officers
  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      console.log('Fetching admins from:', `${apiUrl}/api/admin/admins`);
      console.log('Fetching event officers from:', `${apiUrl}/api/admin/event-officers`);
      const [adminResponse, eventOfficerResponse] = await Promise.all([
        axios.get(`${apiUrl}/api/admin/admins`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/api/admin/event-officers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      console.log('Admins:', adminResponse.data);
      console.log('Event Officers:', eventOfficerResponse.data);
      // Deduplicate by _id
      const combinedUsers = [...adminResponse.data, ...eventOfficerResponse.data];
      const uniqueUsers = Array.from(
        new Map(combinedUsers.map(user => [user._id, user])).values()
      );
      console.log('Unique Users:', uniqueUsers);
      setAdmins(uniqueUsers);
    } catch (err) {
      console.error('Error fetching admins/event officers:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  };
  useEffect(() => {
    fetchAdmins();
  }, [navigate]);

  // Handle admin/event officer creation
  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!adminForm.role) {
      alert("Please select a role (admin or event officer)");
      return;
    }

    if (!adminForm.email.endsWith('@guc.edu.eg')) {
      alert("Email must end with @guc.edu.eg");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Session expired. Please log in again.");
        navigate('/');
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const url = `${apiUrl}/api/admin/create/${adminForm.role}`;
      console.log('API URL:', url);
      console.log('Payload:', { name: adminForm.name, email: adminForm.email, password: adminForm.password });
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
        console.log('Response status:', response.status);
        console.log('Response body:', data);
        throw new Error(data?.message || `Failed to create user (Status: ${response.status})`);
      }

      alert(`Successfully created ${adminForm.role}: ${data.user.name}`);
      setAdminForm({ name: "", email: "", password: "", role: "" });
      fetchAdmins();
    } catch (error) {
      console.error("Error creating user:", error.message);
      alert(`Error creating user: ${error.message}`);
    }
  };

  // Handle admin/event officer deletion
  const handleDeleteUser = async (id, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role} account?`)) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      console.log('Deleting user:', { id, role, url: `${apiUrl}/api/admin/delete-user/${id}` });
      await axios.delete(`${apiUrl}/api/admin/delete-user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(admins.filter((user) => user._id !== id));
      alert(`${role} deleted successfully`);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || `Failed to delete ${role}`);
    }
  };

  // Handle user approval
  const handleApprove = async (id, role) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      await axios.post(
        `${apiUrl}/api/admin/approve-user/${id}`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingUsers(pendingUsers.filter((user) => user._id !== id));
      alert('Verification email sent to user');
    } catch (err) {
      console.error('Error approving user:', err);
      alert(err.response?.data?.message || 'Failed to approve user');
    }
  };

  // Handle logout
  const handleLogout = () => {
    console.log('Logging out from AdminDashboard, token:', localStorage.getItem('token'));
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 logout-button"
        >
          Logout
        </button>
      </div>

      {/* Create Admin Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Create Admin/Event Officer Account</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block">Name</label>
            <input
              type="text"
              value={adminForm.name}
              onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block">Email (must end with @guc.edu.eg)</label>
            <input
              type="email"
              value={adminForm.email}
              onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block">Role</label>
            <select
              value={adminForm.role}
              onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
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
              onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
              className="border p-2 w-full"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Create Admin/Event Officer
          </button>
        </form>
      </div>

      {/* List Admins and Event Officers */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Existing Admins and Event Officers</h2>
        {admins.length === 0 ? (
          <p>No admins or event officers found.</p>
        ) : (
          <ul className="space-y-2">
            {admins.map((user) => (
              <li key={user._id} className="flex justify-between items-center border p-2">
                <span>{user.name} ({user.email}) - {user.role}</span>
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
              <li key={user._id} className="flex justify-between items-center border p-2">
                <span>
                  {user.name} ({user.email}) - {user.role}
                </span>
                <div>
                  <select
                    defaultValue={user.role}
                    onChange={(e) => handleApprove(user._id, e.target.value)}
                    className="border p-1 mr-2"
                  >
                    <option value="staff">Staff</option>
                    <option value="ta">TA</option>
                    <option value="professor">Professor</option>
                  </select>
                  <button
                    onClick={() => handleApprove(user._id, user.role)}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Upcoming Events Section */}
      <div className="mt-10">
        <UpcomingEvents />
      </div>
    </div>
  );
};

export default AdminDashboard;
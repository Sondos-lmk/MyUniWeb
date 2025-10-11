import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
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
        const response = await axios.get('http://localhost:4000/api/admin/pending-users', {
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

  // Fetch existing admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
        const response = await axios.get('http://localhost:4000/api/admin/admins', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(response.data);
      } catch (err) {
        console.error('Error fetching admins:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      }
    };
    fetchAdmins();
  }, [navigate]);

  // Handle admin creation
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await axios.post('http://localhost:4000/api/admin/create-admin', adminForm, {
        headers: { Authorization: `Bearer ${token}` },
        });
      setAdmins([...admins, response.data.admin]);
      setAdminForm({ name: '', email: '', password: '' });
      alert('Admin created successfully');
    } catch (err) {
      console.error('Error creating admin:', err);
      alert(err.response?.data?.message || 'Failed to create admin');
    }
  };

  // Handle admin deletion
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin account?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      await axios.delete(`http://localhost:4000/api/admin/delete-admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(admins.filter((admin) => admin._id !== id));
      alert('Admin deleted successfully');
    } catch (err) {
      console.error('Error deleting admin:', err);
      alert(err.response?.data?.message || 'Failed to delete admin');
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
      await axios.post(
        `http://localhost:4000/api/admin/approve-user/${id}`,
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
    localStorage.removeItem('token'); // Clear token
    navigate('/'); // Redirect to homepage, matching old AdminDashboard
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
        <h2 className="text-xl font-semibold mb-2">Create Admin Account</h2>
        <form onSubmit={handleCreateAdmin} className="space-y-4">
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
            Create Admin
          </button>
        </form>
      </div>

      {/* List Admins */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Existing Admins</h2>
        {admins.length === 0 ? (
          <p>No admins found.</p>
        ) : (
          <ul className="space-y-2">
            {admins.map((admin) => (
              <li key={admin._id} className="flex justify-between items-center border p-2">
                <span>{admin.name} ({admin.email})</span>
                <button
                  onClick={() => handleDeleteAdmin(admin._id)}
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
    </div>
  );
};

export default AdminDashboard;
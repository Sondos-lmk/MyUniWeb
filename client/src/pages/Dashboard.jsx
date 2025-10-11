import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || 'unknown';
  const [events, setEvents] = useState([]);

  const name = (() => {
    if (!user) return 'Loading...';
    if (role === 'vendor') return user.companyName || 'Vendor';
    return user.name || 'User';
  })();

  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log("User object:", user);

    // Fetch approved bazaar events if vendor
    const fetchEvents = async () => {
      if (role === 'vendor') {
        try {
          const res = await API.get('/events');
          setEvents(res.data);
        } catch (err) {
          console.error("Error fetching vendor events:", err);
        }
      }
    };

    fetchEvents();
  }, [user, role, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Welcome to your dashboard! {name} ({role})
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 logout-button"
        >
          Logout
        </button>
      </div>

      {role === 'vendor' && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Approved Bazaar Events</h2>
          {events.length === 0 ? (
            <p>No approved bazaars yet.</p>
          ) : (
            <ul className="space-y-2">
              {events.map(event => (
                <li key={event._id} className="border p-3 rounded">
                  <h3 className="font-bold">{event.title}</h3>
                  <p>{event.description}</p>
                  <p className="text-sm text-gray-600">
                    Status: {event.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="text-center mt-4">Dashboard content for {role}</p>
    </div>
  );
}

export default Dashboard;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'unknown';
  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log('Dashboard.jsx mounted, role:', role);
    console.log('localStorage:', { token, role });
    console.log('Button should be visible with class: bg-red-600 logout-button');
    const logoutButton = document.querySelector('.logout-button');
    console.log('Logout button element:', logoutButton ? 'Found' : 'Not found');
    if (!logoutButton) {
      console.log('Possible CSS issue or wrong component loaded');
    }
  }, [role]);

  const handleLogout = () => {
    console.log('Logging out, role:', role);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome to your dashboard! ({role})</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 logout-button"
          style={{ display: 'block', visibility: 'visible', zIndex: 1000, position: 'relative' }}
        >
          Logout
        </button>
      </div>
      <p className="text-center">Dashboard content for {role}</p>
    </div>
  );
}

export default Dashboard;
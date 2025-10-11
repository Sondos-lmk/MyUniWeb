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

  const handleNavigateToEventsOffice = () => {
    navigate('/events-office');
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
      
      <div className="mb-8">
        <p className="text-center mb-6">Dashboard content for {role}</p>
        
        {/* Role-specific navigation */}
        {role === 'eventsOffice' && (
          <div className="text-center">
            <button
              onClick={handleNavigateToEventsOffice}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go to Events Office Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
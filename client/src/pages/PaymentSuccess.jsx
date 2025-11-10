import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";



/**
 * Reads the user's role from localStorage and returns the
 * correct dashboard path.
 */
const getDashboardLink = () => {
    const { user } = useAuth();
  try {
    // We assume the user object is stored in localStorage after login.
    // If your key is different (e.g., 'auth'), change it here.
    
    if (!user) {
      console.warn('PaymentSuccess: No user found in localStorage.');
      return '/'; // Fallback to login
    }
// Map roles to their dashboard routes based on your App.jsx
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'professor':
        return '/professor/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'ta':
        return '/ta/dashboard';
      case 'admin':
        return '/admin';
      case 'eventOfficer':
        return '/eventOfficer/dashboard';
      case 'vendor':
        return '/vendor/dashboard';
      default:
        console.warn(`PaymentSuccess: Unknown user role '${user.role}'.`);
        return '/'; // Fallback to login
    }
  } catch (error) {
    console.error('PaymentSuccess: Error reading user from localStorage.', error);
    return '/'; // Fallback to login on error
  }
};

export default function PaymentSuccess() {
  // Call the function to get the correct URL
  const dashboardUrl = getDashboardLink();
  console.log(dashboardUrl)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
      <div className="bg-white p-10 rounded-lg shadow-xl">
        <div className="text-9xl text-green-500">
          ✅
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mt-6 mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for your payment. Your registration is confirmed.
        </p>
        
        <Link
          to={dashboardUrl} // <-- This is now dynamic
          className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Your Dashboard
        </Link>
      </div>
    </div>
  );
}
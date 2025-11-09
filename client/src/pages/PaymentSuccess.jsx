import React from 'react';
import { Link } from 'react-router-dom';

export default function PaymentSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
      <div className="bg-white p-10 rounded-lg shadow-xl">
        {/* You can use an SVG icon here for the checkmark */}
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
          to="/student/dashboard" // <-- This is the button you wanted
          className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Your Dashboard
        </Link>
      </div>
    </div>
  );
}
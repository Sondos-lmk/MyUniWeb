import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ModernAlert from './ui/ModernAlert';

// This component shows the application form
const LoyaltyApplyForm = ({ onApplySuccess }) => {
  const [discountRate, setDiscountRate] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [terms, setTerms] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions to apply.');
      return;
    }
    
    setLoading(true);

    try {
      await API.post('/loyalty/apply', {
        discountRate: Number(discountRate),
        promoCode,
        termsAndConditions: terms,
      });
      setAlertMessage('Application successful! You are now in the loyalty program.');
      setAlertType("success");
      onApplySuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-black-700">Apply to GUC Loyalty Program</h3>
        <p className="text-gray-600 mb-4">Offer a discount to GUC students and staff to be listed as a loyalty partner.</p>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="discountRate">
            Discount Rate (%)
          </label>
          <input
            id="discountRate"
            type="number"
            min="1"
            max="100"
            value={discountRate}
            onChange={(e) => setDiscountRate(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="e.g., 15"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="promoCode">
            Promo Code
          </label>
          <input
            id="promoCode"
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="e.g., GUC15OFF"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="terms">
            Add Note
          </label>
          <textarea
            id="terms"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="e.g., Discount valid on weekdays only..."
            rows="3"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="flex items-center text-gray-700">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span>By checking this box, you agree to our terms and conditions.</span>
          </label>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Apply to Program'}
        </button>
      </form>

      <ModernAlert 
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />
    </>
  );
};

// This component shows the current status and cancel button
const LoyaltyStatusDisplay = ({ entry, onCancelSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  const showConfirm = (message, onConfirm) => {
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
  };

  const handleCancel = async () => {
    showConfirm(
      'Are you sure you want to cancel your participation? This action cannot be undone.',
      async () => {
        setLoading(true);
        try {
          await API.delete('/loyalty/cancel');
          setAlertMessage('Participation cancelled successfully.');
          setAlertType("success");
          onCancelSuccess();
        } catch (err) {
          setAlertMessage(err.response?.data?.error || 'Failed to cancel.');
          setAlertType("error");
        } finally {
          setLoading(false);
        }
      }
    );
  };
  
  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md border border-green-200">
        <h3 className="text-xl font-semibold mb-4 text-green-700">You are in the Loyalty Program!</h3>
        <p className="text-gray-700 mb-2">
          <strong>Discount Rate:</strong> {entry.discountRate}%
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Promo Code:</strong> {entry.promoCode}
        </p>
        {entry.termsAndConditions && (
          <p className="text-gray-600 mb-4 border-t pt-2 mt-2">
            <strong>Note:</strong> {entry.termsAndConditions}
          </p>
        )}
        <button
          onClick={handleCancel}
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? 'Cancelling...' : 'Cancel Participation'}
        </button>
      </div>

      {/* Regular Alert */}
      <ModernAlert 
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />

      {/* Confirmation Dialog */}
      <ModernAlert 
        message={confirmMessage}
        isConfirm={true}
        onConfirm={confirmAction}
        onClose={() => setConfirmMessage(null)}
      />
    </>
  );
};

// This is the main component you will import
export default function LoyaltyManager() {
  const [loyaltyStatus, setLoyaltyStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await API.get('/loyalty/status');
      setLoyaltyStatus(res.data);
    } catch (err) {
      console.error("Error fetching loyalty status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (isLoading) {
    return <div className="text-center p-6">Loading Loyalty Program status...</div>;
  }

  return (
    <div className="my-6">
      {loyaltyStatus ? (
        <LoyaltyStatusDisplay entry={loyaltyStatus} onCancelSuccess={fetchStatus} />
      ) : (
        <LoyaltyApplyForm onApplySuccess={fetchStatus} />
      )}
    </div>
  );
}
import { useEffect } from 'react';

const ModernAlert = ({ message, type = 'success', onClose, isConfirm = false, onConfirm }) => {
  useEffect(() => {
    if (message && !isConfirm) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose, isConfirm]);

  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] px-4">
      <div 
        className={`bg-white rounded-xl shadow-2xl p-6 max-w-md w-full transform transition-all ${
          isConfirm ? 'border-t-4 border-yellow-500' : 
          type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
        }`}
      >
        <div className="flex items-start gap-4">
          {isConfirm ? (
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ) : type === 'success' ? (
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <p className={`font-semibold ${
              isConfirm ? 'text-yellow-800' : 
              type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {isConfirm ? 'Confirmation Required' : type === 'success' ? 'Success!' : 'Error'}
            </p>
            <p className="text-gray-600 mt-1">{message}</p>
          </div>
          {!isConfirm && (
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Confirmation Buttons */}
        {isConfirm && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernAlert;
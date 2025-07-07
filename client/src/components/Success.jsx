import React from 'react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login'); // Navigate to the login page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#2c3e50] text-white p-4 font-sans">
      <div className="bg-[#1a1d23] p-8 md:p-12 rounded-xl shadow-2xl text-center max-w-md w-full border border-green-700">
        {/* Success Logo (SVG Checkmark) */}
        <div className="flex justify-center mb-6">
          <svg
            className="w-24 h-24 text-green-500 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>

        <h2 className="text-4xl font-bold mb-4 text-green-400 drop-shadow-lg">Order Placed Successfully!</h2>
        <p className="text-lg text-gray-300 mb-6">
          Your order has been successfully processed.
        </p>

        <div className="bg-[#2e353e] p-6 rounded-lg mb-8 text-left">
          <h3 className="text-xl font-semibold mb-3 text-white">Access Your Account:</h3>
          <p className="text-gray-300 mb-2">
            You can now log in to your account to check your order details.
          </p>
          <p className="text-gray-200 font-medium mb-3">
            Use your email and the default password: <span className="text-yellow-300 font-bold">Souktek123</span>
          </p>
          <p className="text-red-300 text-sm font-semibold">
            ⚠️ For security, please change this default password immediately after your first login.
          </p>
        </div>

        <button
          onClick={handleLoginRedirect}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Success;

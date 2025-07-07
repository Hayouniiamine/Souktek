import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import  API_BASE_URL from '../config';

const SecretKeyVerification = () => {
  const navigate = useNavigate();
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is an admin
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!userData || !token || !userData.is_admin) {
      // If not logged in, no token, or not an admin, redirect to login
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleSecretKeySubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication token missing. Please log in again.");
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/verify-secret`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Send the JWT token
        },
        body: JSON.stringify({ secretKey }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("adminSecretVerified", "true"); // Set a flag for frontend
        navigate("/admin-dashboard");
      } else {
        setError(data.message || "Secret key verification failed.");
      }
    } catch (error) {
      console.error("Secret key verification error:", error);
      setError("Network error. Could not connect to server.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-800 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800 text-white">
      <div className="bg-[#1a1d23] p-8 rounded-lg shadow-lg w-full sm:w-96">
        <h2 className="text-3xl font-bold text-center mb-6">Enter Admin Secret Key</h2>
        <form onSubmit={handleSecretKeySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Secret Key
            </label>
            <input
              type="password" // Changed to password type for security
              className="w-full p-2 bg-[#1a1d23] border border-gray-600 rounded-md text-white"
              placeholder="Enter the secret key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 p-2 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Verify
          </button>
          {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default SecretKeyVerification;
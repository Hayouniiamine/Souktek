import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart } from "react-icons/fa"; // Import the shopping cart icon for the logo
import API_BASE_URL from '../config';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); // Added username for user registration
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!email || !username || !password || !confirmPassword) {
      setErrorMessage('All fields are required!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      // Send POST request to signup endpoint
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }), // Only regular user signup
      });
      

      const data = await response.json();

      if (response.ok) {
        // If signup is successful, alert user and navigate to login page
        alert('Account created successfully!');
        navigate('/login');
      } else {
        // Handle errors returned by the server
        setErrorMessage(data.message || "Something went wrong, please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage("Something went wrong, please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1117] flex justify-center items-center py-12 px-4">
      <div className="bg-[#1a1d23] p-10 rounded-lg shadow-lg w-full max-w-md">
        {/* Logo and Description */}
        <div className="text-center mb-8">
          <FaShoppingCart className="text-5xl text-blue-500 mb-3 mx-auto" />
          <h2 className="text-4xl font-bold text-white">Create Your Account</h2>
          <p className="text-sm text-gray-400 mt-2">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Login here
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-md bg-[#2a2f36] text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-4 py-3 rounded-md bg-[#2a2f36] text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-md bg-[#2a2f36] text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 rounded-md bg-[#2a2f36] text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition duration-300"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            By signing up, you agree to our{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
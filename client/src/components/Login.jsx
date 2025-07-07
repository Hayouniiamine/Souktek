import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa"; // Import the shopping cart icon for the logo
import API_BASE_URL from '../config';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);

        // Save token and user data to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect to the correct page based on user role
        if (data.user.is_admin) {
          // Clear any previous adminSecretVerified flag to ensure re-verification
          localStorage.removeItem("adminSecretVerified"); // <--- ADDED THIS LINE
          navigate("/secret-key-verification");  // Redirect to secret key verification for admin
        } else {
          navigate("/user-dashboard");  // Redirect to user dashboard for regular users
        }
      } else {
        console.log("Login failed:", data);
        setErrorMessage(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Something went wrong, please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1117] flex justify-center items-center py-12 px-4">
      <div className="bg-[#1a1d23] p-10 rounded-lg shadow-lg w-full max-w-md">
        {/* Logo and Description */}
        <div className="text-center mb-8">
          <FaShoppingCart className="text-5xl text-blue-500 mb-3 mx-auto" />
          <h2 className="text-4xl font-bold text-white">Welcome Back!</h2>
          <p className="text-sm text-gray-400 mt-2">
            Sign in to access your account and manage your orders.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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

          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-md bg-[#2a2f36] text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
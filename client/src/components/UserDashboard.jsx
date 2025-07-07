import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem('user'));
    if (!userFromStorage) {
      navigate('/login');
    } else {
      setUser(userFromStorage);
      // Pass userFromStorage.email to fetchRecentOrders
      fetchRecentOrders(userFromStorage.email);
      setLoading(false);
    }
  }, [navigate]);

  // Updated to fetch orders by email
  const fetchRecentOrders = async (userEmail) => {
    try {
      // Use the new API route to fetch orders by email
      const response = await fetch(`http://localhost:5000/api/orders/email/${encodeURIComponent(userEmail)}`);
      const data = await response.json();

      if (response.ok) {
        // Assuming the backend returns an array of orders directly
        setRecentOrders(data);
      } else {
        console.error("Failed to fetch orders:", data.message);
        setRecentOrders([]); // Clear orders on error
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setRecentOrders([]); // Clear orders on error
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword === confirmNewPassword) {
      try {
        // Ensure you have an email for the user to send to the backend
        if (!user || !user.email) {
          alert('User email not found. Cannot change password.');
          return;
        }

        const response = await fetch('http://localhost:5000/api/users/password', { // Corrected endpoint
          method: 'PUT', // Use PUT for updating password
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email, // Send email for password change
            newPassword: newPassword,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          // Replace alert() with a custom modal or message box
          // For now, using console.log as a placeholder
          console.log('Password changed successfully!');
          navigate('/login');
        } else {
          // Replace alert() with a custom modal or message box
          console.error(data.message || 'Failed to change password.');
        }
      } catch (error) {
        console.error('Error changing password:', error);
        // Replace alert() with a custom modal or message box
        console.error('Something went wrong. Please try again.');
      }
    } else {
      // Replace alert() with a custom modal or message box
      console.error('Passwords do not match!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#2c3e50] text-white p-6">
      <h2 className="text-4xl font-bold text-center mb-10 drop-shadow-md">👤 Welcome, {user.email}</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* User Info & Logout */}
        <div className="bg-[#1a1d23] p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">Account Info</h3>
          <p className="mb-6 text-lg text-gray-300">Email: <span className="text-white font-medium">{user.email}</span></p>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500 hover:bg-red-600 rounded-md font-semibold"
          >
            🚪 Log Out
          </button>
        </div>

        {/* Change Password */}
        <form
          onSubmit={handleChangePassword}
          className="bg-[#1a1d23] p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-2xl font-semibold mb-6">🔐 Change Password</h3>
          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-400" htmlFor="password">Current Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#2e353e] text-white focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-400" htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#2e353e] text-white focus:outline-none"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 text-sm text-gray-400" htmlFor="confirmNewPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#2e353e] text-white focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Recent Orders */}
      <div className="mt-12 bg-[#1a1d23] p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-semibold mb-6">📦 Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400">No recent orders found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#2e353e] p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <p className="text-md font-semibold mb-2">🛍️ {order.product_name}</p> {/* Changed to product_name */}
                <p className="text-sm text-gray-400 mb-1">Date: {new Date(order.order_time).toLocaleDateString()}</p> {/* Changed to order_time */}
                <p className="text-sm text-gray-400">Payment Method: <span className="text-white">{order.payment_method}</span></p> {/* Added payment_method */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

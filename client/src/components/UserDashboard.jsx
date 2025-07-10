import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const UserDashboard = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!userFromStorage || !token) {
      navigate('/login');
      return;
    }

    setUser(userFromStorage);

    // Fetch orders using user email and token
    fetchRecentOrders(userFromStorage.email, token).finally(() => setLoading(false));
  }, [navigate]);

  const fetchRecentOrders = async (userEmail, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/user/${encodeURIComponent(userEmail)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRecentOrders(data);
      } else {
        console.error('Failed to fetch orders:', data.message);
        setRecentOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setRecentOrders([]);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      console.error('Passwords do not match!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Session expired, please login again.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Password changed successfully!');
        alert('Password updated! Please log in again.');
        // Clear user and token on password change
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        console.error(data.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#2c3e50] text-white p-6">
      <h2 className="text-4xl font-bold text-center mb-10 drop-shadow-md">Welcome, {user.email}</h2>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Profile Settings */}
        <div className="bg-[#1a1d23] p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-6">Profile Settings</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#2e353e] text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#2e353e] text-white focus:outline-none"
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
          <h3 className="text-2xl font-semibold mb-6">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400">No recent orders found.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#2e353e] p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <p className="text-md font-semibold mb-2">{order.product_name}</p>
                  <p className="text-sm text-gray-400 mb-1">Date: {new Date(order.order_time).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-400">Amount: ${order.price ? parseFloat(order.price).toFixed(2) : 'N/A'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;

// src/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL  from '../config';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  const [totalProducts, setTotalProducts] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);
  const [mostExpensive, setMostExpensive] = useState({ name: 'N/A', price: 0 });
  const [lowestStock, setLowestStock] = useState({ name: 'N/A', stock: 0 });
  const [mostPopular, setMostPopular] = useState({ name: 'N/A', sold: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  useEffect(() => {
  const userData = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const adminSecretVerified = localStorage.getItem('adminSecretVerified');

  if (!userData || !token || !userData.is_admin) {
    console.log("AdminDashboard: Not logged in as admin or token missing. Redirecting...");
    navigate('/login');
    return;
  }

  if (!adminSecretVerified) {
    console.log("AdminDashboard: Admin secret not verified. Redirecting to secret verification.");
    navigate('/secret-key-verification');
    return;
  }

  const fetchOrdersAndStats = async () => {
    try {
      // Fetch all products
      const productRes = await fetch(`${API_BASE_URL}/api/products`);
      const products = await productRes.json();

      setTotalProducts(products.length);

      const prices = products.map(p => parseFloat(p.price)).filter(p => !isNaN(p));
      const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      setAveragePrice(avg || 0);

      const mostExp = products.reduce((prev, curr) => parseFloat(curr.price) > parseFloat(prev.price) ? curr : prev, products[0]);
      setMostExpensive(mostExp || { name: 'N/A', price: 0 });

      const withStock = products.filter(p => p.stock !== undefined && p.stock !== null);
      const lowestStockProduct = withStock.reduce((prev, curr) => (curr.stock < prev.stock ? curr : prev), withStock[0]);
      setLowestStock(lowestStockProduct || { name: 'N/A', stock: 0 });

      // Fetch orders
      const ordersRes = await fetch(`${API_BASE_URL}/api/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!ordersRes.ok) throw new Error(`Orders fetch failed: ${ordersRes.status}`);
      const orders = await ordersRes.json();
      setAllOrders(orders);

      const productCountMap = {};
      orders.forEach(order => {
        const name = order.product_name;
        productCountMap[name] = (productCountMap[name] || 0) + 1;
      });

      let mostPopularName = 'N/A';
      let maxCount = 0;
      for (const [name, count] of Object.entries(productCountMap)) {
        if (count > maxCount) {
          mostPopularName = name;
          maxCount = count;
        }
      }
      setMostPopular({ name: mostPopularName, sold: maxCount });

    } catch (err) {
      setErrorStats(err.message);
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoadingStats(false);
      setLoadingOrders(false);
    }
  };

  fetchOrdersAndStats();
}, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminSecretVerified');
    navigate('/login');
  };

  if (loadingOrders || loadingStats) {
    return (
      <div className="min-h-screen bg-gray-800 flex justify-center items-center text-white text-xl">
        Loading Admin Dashboard...
      </div>
    );
  }

  if (errorOrders || errorStats) {
    return (
      <div className="min-h-screen bg-gray-800 flex justify-center items-center text-red-500 text-xl">
        Error loading data: {errorOrders || errorStats}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>

        {/* Admin Actions Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-center text-blue-400">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/admin/create-product"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-center transition duration-300 transform hover:scale-105"
            >
              Create Product
            </Link>
            <Link
              to="/admin/update-product"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-center transition duration-300 transform hover:scale-105"
            >
              Update Product
            </Link>
            <Link
              to="/admin/delete-product"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-center transition duration-300 transform hover:scale-105"
            >
              Delete Product
            </Link>
          </div>
        </div>

        {/* Product Statistics Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-center text-purple-400">Product Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-gray-400">Total Products</p>
              <p className="text-3xl font-bold text-indigo-300">{totalProducts}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-gray-400">Average Price</p>
              <p className="text-3xl font-bold text-green-300">${averagePrice.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-gray-400">Most Expensive</p>
              <p className="text-xl font-bold text-red-300">{mostExpensive.name}</p>
              <p className="text-lg text-red-300">(${mostExpensive.price?.toFixed(2) || '0.00'})</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-gray-400">Lowest Stock</p>
              <p className="text-xl font-bold text-yellow-300">{lowestStock.name}</p>
              <p className="text-lg text-yellow-300">(Stock: {lowestStock.stock})</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-gray-400">Most Popular</p>
              <p className="text-xl font-bold text-teal-300">{mostPopular.name}</p>
              <p className="text-lg text-teal-300">(Sold: {mostPopular.sold})</p>
            </div>
          </div>
        </div>

        {/* All Orders Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-3xl font-semibold mb-6 text-center text-blue-400">All Orders</h2>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-700 text-gray-300 uppercase text-sm">
                  <th className="py-3 px-6 border-b border-gray-200">Order ID</th>
                  <th className="py-3 px-6 border-b border-gray-200">Product Name</th>
                  <th className="py-3 px-6 border-b border-gray-200">Customer Email</th>
                  <th className="py-3 px-6 border-b border-gray-200">Payment Method</th>
                  <th className="py-3 px-6 border-b border-gray-200">Order Time</th>
                  <th className="py-3 px-6 border-b border-gray-200">User ID</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {allOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 whitespace-nowrap">{order.id}</td>
                    <td className="py-3 px-6">{order.product_name}</td>
                    <td className="py-3 px-6">{order.email}</td>
                    <td className="py-3 px-6">{order.payment_method}</td>
                    <td className="py-3 px-6">
                      {new Date(order.order_time).toLocaleString()}
                    </td>
                    <td className="py-3 px-6">{order.user_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

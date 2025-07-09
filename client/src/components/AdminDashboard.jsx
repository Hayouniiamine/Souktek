import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from '../config';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [allOrders, setAllOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0); // replaced average price
  const [orderCount, setOrderCount] = useState(0);    // replaced most expensive
  const [mostPopular, setMostPopular] = useState({ name: 'N/A', sold: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const adminSecretVerified = localStorage.getItem('adminSecretVerified');

    if (!userData || !token || !userData.is_admin) {
      navigate('/login');
      return;
    }

    if (adminSecretVerified !== "true") {
      navigate('/secret-key-verification');
      return;
    }

    const headers = { "Authorization": `Bearer ${token}` };

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const response = await fetch(`${API_BASE_URL}/api/orders/all`, { headers });
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setAllOrders(data);
      } catch (error) {
        setErrorOrders(error.message);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchAllStats = async () => {
      setLoadingStats(true);
      try {
        const [totalRes, incomeRes, countRes, popularRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/products/total-count`, { headers }),
          fetch(`${API_BASE_URL}/api/products/total-income`, { headers }),
          fetch(`${API_BASE_URL}/api/orders/count`, { headers }),
          fetch(`${API_BASE_URL}/api/products/most-popular`, { headers })
        ]);

        const totalData = await totalRes.json();
        if (totalRes.ok) setTotalProducts(totalData.total_products || 0);

        const incomeData = await incomeRes.json();
        if (incomeRes.ok) setTotalIncome(parseFloat(incomeData.total_income) || 0);

        const countData = await countRes.json();
        if (countRes.ok) setOrderCount(countData.total_orders || 0);

        const popularData = await popularRes.json();
        if (popularRes.ok) setMostPopular(popularData);

      } catch (error) {
        setErrorStats("Error loading statistics.");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchOrders();
    fetchAllStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminSecretVerified');
    navigate('/login');
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6 flex flex-col">
        <h2 className="text-3xl font-semibold text-center mb-10">Admin Panel</h2>

        <ul className="space-y-4 flex-grow">
          <li><Link to="/admin-dashboard" className="block py-2 px-4 text-lg hover:bg-blue-700 rounded-md">Dashboard</Link></li>
          <li><Link to="/admin/create-product" className="block py-2 px-4 text-lg hover:bg-blue-700 rounded-md">Create Product</Link></li>
          <li><Link to="/admin/read-products" className="block py-2 px-4 text-lg hover:bg-blue-700 rounded-md">View Products</Link></li>
          <li><Link to="/admin/update-product" className="block py-2 px-4 text-lg hover:bg-blue-700 rounded-md">Update Product</Link></li>
          <li><Link to="/admin/delete-product" className="block py-2 px-4 text-lg hover:bg-blue-700 rounded-md">Delete Product</Link></li>
        </ul>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, Admin 👋</h1>
          <p className="text-lg text-gray-600">Manage your store, view analytics, and monitor performance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loadingStats ? (
            <div className="col-span-full text-center text-gray-600">Loading product statistics...</div>
          ) : errorStats ? (
            <div className="col-span-full text-center text-red-600">Error: {errorStats}</div>
          ) : (
            <>
              <div className="bg-blue-100 p-6 rounded-lg shadow text-gray-900">
                <h3 className="text-lg font-semibold mb-2">Total Products</h3>
                <p className="text-3xl font-bold">{totalProducts}</p>
              </div>

              <div className="bg-green-100 p-6 rounded-lg shadow text-gray-900">
                <h3 className="text-lg font-semibold mb-2">Total Income (TND)</h3>
                <p className="text-3xl font-bold">{formatPrice(totalIncome)} DT</p>
              </div>

              <div className="bg-red-100 p-6 rounded-lg shadow text-gray-900">
                <h3 className="text-lg font-semibold mb-2">Number of Orders</h3>
                <p className="text-3xl font-bold">{orderCount}</p>
              </div>

              <div className="bg-purple-100 p-6 rounded-lg shadow text-gray-900">
                <h3 className="text-lg font-semibold mb-2">Most Popular</h3>
                <p className="text-md truncate">{mostPopular.name || 'N/A'}</p>
                <p className="text-xl font-bold">{mostPopular.sold || 0} sold</p>
              </div>
            </>
          )}
        </div>

        {/* Order History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">All Orders History</h3>
          {loadingOrders ? (
            <div className="text-center text-gray-600">Loading orders...</div>
          ) : errorOrders ? (
            <div className="text-center text-red-600">Error: {errorOrders}</div>
          ) : allOrders.length === 0 ? (
            <div className="text-center text-gray-600">No orders found in the system.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 border-b">Order ID</th>
                    <th className="py-3 px-6 border-b">Product Name</th>
                    <th className="py-3 px-6 border-b">Customer Email</th>
                    <th className="py-3 px-6 border-b">Payment Method</th>
                    <th className="py-3 px-6 border-b">Order Time</th>
                    <th className="py-3 px-6 border-b">User ID</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm">
                  {allOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-6">{order.id}</td>
                      <td className="py-3 px-6">{order.product_name}</td>
                      <td className="py-3 px-6">{order.email}</td>
                      <td className="py-3 px-6">{order.payment_method}</td>
                      <td className="py-3 px-6">{new Date(order.order_time).toLocaleString()}</td>
                      <td className="py-3 px-6">{order.user_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

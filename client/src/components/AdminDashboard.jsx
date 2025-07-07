import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate

const AdminDashboard = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [allOrders, setAllOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  // State for product statistics
  const [totalProducts, setTotalProducts] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);
  const [mostExpensive, setMostExpensive] = useState({ name: 'N/A', price: 0 });
  const [lowestStock, setLowestStock] = useState({ name: 'N/A', stock: 0 });
  const [mostPopular, setMostPopular] = useState({ name: 'N/A', sold: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  // Combined useEffect for authentication/authorization and data fetching
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const adminSecretVerified = localStorage.getItem('adminSecretVerified');

    // 1. Check if user is logged in and is an admin
    if (!userData || !token || !userData.is_admin) {
      console.log("AdminDashboard: Not logged in as admin or token missing. Redirecting to login.");
      navigate('/login');
      return; // Stop execution if not authorized
    }

    // 2. Check if admin secret key has been verified for this session
    if (adminSecretVerified !== "true") {
      console.log("AdminDashboard: Admin secret not verified. Redirecting to secret key verification.");
      navigate('/secret-key-verification');
      return; // Stop execution if not verified
    }

    // If authenticated and secret verified, proceed to fetch data
    const fetchAdminData = async () => {
      const headers = {
        "Authorization": `Bearer ${token}`, // Include JWT token in headers
        "Content-Type": "application/json" // Standard header for JSON requests
      };

      // --- Fetch all orders ---
      try {
        setLoadingOrders(true);
        setErrorOrders(null);
        const ordersResponse = await fetch("http://localhost:5000/api/orders/all", { headers });
        const ordersData = await ordersResponse.json();

        if (ordersResponse.ok) {
          setAllOrders(ordersData);
        } else {
          // If the error is due to authentication/authorization, redirect
          if (ordersResponse.status === 401 || ordersResponse.status === 403) {
            console.error("Authentication/Authorization error fetching orders. Redirecting to login.");
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('adminSecretVerified');
            navigate('/login');
          } else {
            setErrorOrders(ordersData.message || "Failed to fetch all orders.");
            setAllOrders([]);
          }
        }
      } catch (error) {
        console.error("Error fetching all orders:", error);
        setErrorOrders("Network error or server unreachable for orders.");
        setAllOrders([]);
      } finally {
        setLoadingOrders(false);
      }

      // --- Fetch product statistics ---
      try {
        setLoadingStats(true);
        setErrorStats(null);

        // Fetch Total Products
        const totalProductsRes = await fetch("http://localhost:5000/api/stats/total-products", { headers });
        const totalProductsData = await totalProductsRes.json();
        if (totalProductsRes.ok) setTotalProducts(totalProductsData.total_products || 0);
        else console.error("Failed to fetch total products:", totalProductsData.message);

        // Fetch Average Price
        const averagePriceRes = await fetch("http://localhost:5000/api/stats/average-price", { headers });
        const averagePriceData = await averagePriceRes.json();
        if (averagePriceRes.ok) setAveragePrice(parseFloat(averagePriceData.average_price) || 0);
        else console.error("Failed to fetch average price:", averagePriceData.message);

        // Fetch Most Expensive
        const mostExpensiveRes = await fetch("http://localhost:5000/api/stats/most-expensive", { headers });
        const mostExpensiveData = await mostExpensiveRes.json();
        if (mostExpensiveRes.ok) setMostExpensive({ name: mostExpensiveData.name, price: parseFloat(mostExpensiveData.price) });
        else if (mostExpensiveRes.status !== 404) console.error("Failed to fetch most expensive:", mostExpensiveData.message);

        // Fetch Lowest Stock
        const lowestStockRes = await fetch("http://localhost:5000/api/stats/lowest-stock", { headers });
        const lowestStockData = await lowestStockRes.json();
        if (lowestStockRes.ok) setLowestStock({ name: lowestStockData.name, stock: parseInt(lowestStockData.stock) });
        else if (lowestStockRes.status !== 404) console.error("Failed to fetch lowest stock:", lowestStockData.message);

        // Fetch Most Popular
        const mostPopularRes = await fetch("http://localhost:5000/api/stats/most-popular", { headers });
        const mostPopularData = await mostPopularRes.json();
        if (mostPopularRes.ok) setMostPopular({ name: mostPopularData.product_name, sold: parseInt(mostPopularData.total_sold_count) });
        else if (mostPopularRes.status !== 404) console.error("Failed to fetch most popular:", mostPopularData.message);

      } catch (error) {
        console.error("Error fetching product statistics:", error);
        setErrorStats("Network error or server unreachable for statistics.");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchAdminData();
  }, [navigate]); // navigate is a dependency because it's used inside the effect

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6">
        <h2 className="text-3xl font-semibold text-center text-white mb-10">
          Admin Dashboard
        </h2>

        {/* Sidebar Navigation */}
        <ul className="space-y-4">
          <li>
            <Link
              to="/admin-dashboard"
              className="block py-2 px-4 text-lg hover:bg-blue-700 rounded-md transition duration-300"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/admin/create-product"
              className="block py-2 px-4 text-lg hover:bg-blue-700 rounded-md transition duration-300"
            >
              Create Product
            </Link>
          </li>
          <li>
            <Link
              to="/admin/read-products"
              className="block py-2 px-4 text-lg hover:bg-blue-700 rounded-md transition duration-300"
            >
              View Products
            </Link>
          </li>
          <li>
            <Link
              to="/admin/update-product"
              className="block py-2 px-4 text-lg hover:bg-blue-700 rounded-md transition duration-300"
            >
              Update Product
            </Link>
          </li>
          <li>
            <Link
              to="/admin/delete-product"
              className="block py-2 px-4 text-lg hover:bg-blue-700 rounded-md transition duration-300"
            >
              Delete Product
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 bg-gray-50">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-700">Welcome, Admin 👋</h1>
          <p className="text-lg text-gray-600">
            Manage your store, view analytics, and monitor product performance.
          </p>
        </div>

        {/* Product Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loadingStats ? (
            <div className="col-span-full text-center text-gray-600">Loading product statistics...</div>
          ) : errorStats ? (
            <div className="col-span-full text-center text-red-600">Error: {errorStats}</div>
          ) : (
            <>
              <div className="bg-blue-100 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Products</h3>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>

              <div className="bg-green-100 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Average Price</h3>
                <p className="text-2xl font-bold">${averagePrice.toFixed(2)}</p>
              </div>

              <div className="bg-red-100 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Most Expensive</h3>
                <p className="text-md">{mostExpensive.name}</p>
                <p className="text-xl font-bold">${mostExpensive.price.toFixed(2)}</p>
              </div>

              <div className="bg-yellow-100 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Lowest Stock</h3>
                <p className="text-md">{lowestStock.name}</p>
                <p className="text-xl font-bold">{lowestStock.stock} units</p>
              </div>

              <div className="bg-purple-100 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Most Popular</h3>
                <p className="text-md">{mostPopular.name}</p>
                <p className="text-xl font-bold">{mostPopular.sold} sold</p>
              </div>
            </>
          )}
        </div>

        {/* All Orders History */}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

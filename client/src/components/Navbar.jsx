import React, { useState, useEffect } from "react";
import { FaSearch, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useCart } from "./context/CartContext";
import  API_BASE_URL  from '../config';
export default function Navbar() {
  const navigate = useNavigate(); // Initialize useNavigate
  const { getCartTotalItems } = useCart(); // Get getCartTotalItems from context
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // Fetch all products when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const data = await res.json();
      setAllProducts(data);
    };
    fetchProducts();
  }, []);

  // Search products based on the query
  useEffect(() => {
    if (searchQuery) {
      const results = allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allProducts]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <nav className="bg-[#0e1117] text-white py-4 px-6 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-2">
        {/* Changed logo to logo.png located in the public/images folder */}
        <img src="/images/logo.png" alt="Souktek Logo" className="h-8" />{" "}
        {/* Adjust height as needed */}
        <span className="text-sm text-gray-400 hidden sm:inline">Buy Gift Cards Online</span>
      </div>

      <div className="flex-1 mx-6 hidden md:flex">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full py-2 pl-10 pr-4 rounded-full bg-[#1c2027] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        {searchResults.length > 0 && searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1c2027] rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
            <ul className="py-1">
              {searchResults.map((product) => (
                <li
                  key={product.id}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                >
                  <Link
                    to={`/product/${product.name}`}
                    className="block text-white"
                    onClick={() => setSearchResults([])}
                  >
                    {" "}
                    {/* Clear results on click */}
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Currency dropdown */}
        <div className="flex items-center space-x-1 text-sm cursor-pointer">
          {/* Changed flag to Tunisia and currency to TND */}
          <img
            src="https://flagcdn.com/tn.svg"
            alt="Tunisia Flag"
            className="w-5 h-3 rounded-sm"
          />
          <span>TND (DT)</span>
          <FiChevronDown className="text-gray-400" />
        </div>

        {/* Shopping cart icon with dynamic product count */}
        <div className="relative cursor-pointer" onClick={() => navigate("/basket")}>
          {" "}
          {/* Navigate to basket on click */}
          <FaShoppingCart className="text-xl" />
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1.5 rounded-full">
            {getCartTotalItems()}{" "}
            {/* Use getCartTotalItems from context */}
          </span>
        </div>

        {/* User icon, links to login page */}
        <Link to="/login">
          <FaUserCircle className="text-xl" />
        </Link>
      </div>
    </nav>
  );
}
import React, { useState, useEffect } from "react";
import { FaSearch, FaShoppingCart, FaUserCircle, FaTimes } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./context/CartContext";
import API_BASE_URL from "../config";

export default function Navbar() {
  const navigate = useNavigate();
  const { getCartTotalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setAllProducts(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProducts();
  }, []);

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

  const closeSearch = () => {
    setSearchResults([]);
    setSearchQuery("");
    setShowMobileSearch(false);
  };

  return (
    <>
      <nav className="bg-[#0e1117] text-white py-3 px-4 sm:px-6 flex items-center justify-between shadow-lg relative z-40">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            {/* Increased logo size and width */}
            <img
              src="uploads/1752752377367.png"
              alt="Souktek Logo"
              className="h-12 w-32 sm:h-14 sm:w-40 object-contain cursor-pointer"
            />
          </Link>
        </div>

        {/* Desktop Search */}
        <div className="flex-1 mx-6 hidden lg:flex justify-center">
          <div className="w-full max-w-lg relative">
            <input
              type="text"
              placeholder="Search for games, gift cards and more..."
              className="w-full py-2.5 pl-12 pr-4 rounded-full bg-[#1c2027] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchResults.length > 0 && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c2027] rounded-md shadow-lg max-h-80 overflow-y-auto z-50">
                <ul className="py-1">
                  {searchResults.map((product) => (
                    <li key={product.id}>
                      <Link
                        to={`/product/${encodeURIComponent(product.name)}`}
                        className="block px-4 py-2 hover:bg-gray-700"
                        onClick={closeSearch}
                      >
                        {product.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="lg:hidden">
            <button onClick={() => setShowMobileSearch(true)} aria-label="Open search">
              <FaSearch className="text-xl hover:text-blue-400 transition-colors" />
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-1 text-sm cursor-pointer hover:text-gray-300">
            <img
              src="https://flagcdn.com/tn.svg"
              alt="Tunisia Flag"
              className="w-5 h-3 rounded-sm"
            />
            <span>TND</span>
            <FiChevronDown className="text-gray-400" />
          </div>

          <div className="relative cursor-pointer" onClick={() => navigate("/basket")}>
            <FaShoppingCart className="text-xl hover:text-blue-400 transition-colors" />
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {getCartTotalItems()}
            </span>
          </div>

          <Link to="/login" aria-label="User account">
            <FaUserCircle className="text-xl hover:text-blue-400 transition-colors" />
          </Link>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-[#0e1117] z-50 transform transition-transform duration-300 ease-in-out ${
          showMobileSearch ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Search Products</h2>
            <button onClick={closeSearch} aria-label="Close search">
              <FaTimes className="text-2xl" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-3 pl-12 pr-4 rounded-full bg-[#1c2027] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex-grow overflow-y-auto mt-4">
            {searchResults.length > 0 && searchQuery && (
              <ul>
                {searchResults.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/product/${encodeURIComponent(product.name)}`}
                      className="block p-3 hover:bg-gray-800 rounded-md"
                      onClick={closeSearch}
                    >
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

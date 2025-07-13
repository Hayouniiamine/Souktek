import React, { useState, useEffect } from "react";
import { FaSearch, FaShoppingCart, FaUserCircle } from "react-icons/fa";
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
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const data = await res.json();
      setAllProducts(data);
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

  return (
    <nav className="bg-[#0e1117] text-white py-4 px-6 flex items-center justify-between shadow-lg relative z-50 flex-wrap">
      {/* Logo + Tagline */}
<div className="flex items-center space-x-2">
  <Link to="/">
    <img
      src="uploads/1752415767378.png"
      alt="Souktek Logo"
      className="h-12 sm:h-14 cursor-pointer"
    />
  </Link>
  <span className="text-sm text-gray-400 hidden sm:inline">
    Buy Gift Cards Online
  </span>
</div>

      {/* Desktop Search */}
      <div className="flex-1 mx-6 hidden md:flex flex-col relative">
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
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c2027] rounded-md shadow-lg max-h-60 overflow-y-auto z-50 w-full max-w-md">
            <ul className="py-1">
              {searchResults.map((product) => (
                <li
                  key={product.id}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                >
                  <Link
                    to={`/product/${encodeURIComponent(product.name)}`}
                    className="block text-white"
                    onClick={() => {
                      setSearchResults([]);
                      setSearchQuery("");
                      setShowMobileSearch(false);
                    }}
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right Icons */}
      <div className="flex items-center space-x-4">
        <div className="md:hidden">
          <button onClick={() => setShowMobileSearch((prev) => !prev)}>
            <FaSearch className="text-xl" />
          </button>
        </div>

        <div className="flex items-center space-x-1 text-sm cursor-pointer">
          <img
            src="https://flagcdn.com/tn.svg"
            alt="Tunisia Flag"
            className="w-5 h-3 rounded-sm"
          />
          <span>TND (DT)</span>
          <FiChevronDown className="text-gray-400" />
        </div>

        <div className="relative cursor-pointer" onClick={() => navigate("/basket")}>
          <FaShoppingCart className="text-xl" />
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1.5 rounded-full">
            {getCartTotalItems()}
          </span>
        </div>

        <Link to="/login">
          <FaUserCircle className="text-xl" />
        </Link>
      </div>

      {/* Mobile Search Input */}
      {showMobileSearch && (
        <div className="w-full mt-3 md:hidden relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full py-2 pl-10 pr-4 rounded-full bg-[#1c2027] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          {searchResults.length > 0 && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c2027] rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
              <ul className="py-1">
                {searchResults.map((product) => (
                  <li
                    key={product.id}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                  >
                    <Link
                      to={`/product/${encodeURIComponent(product.name)}`}
                      className="block text-white"
                      onClick={() => {
                        setSearchResults([]);
                        setSearchQuery("");
                        setShowMobileSearch(false);
                      }}
                    >
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

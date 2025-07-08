// src/ProductPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./context/CartContext";
import API_BASE_URL from "../config"; // Ensure this path is correct based on your project structure

export default function ProductPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Use the addToCart function from context
  const [product, setProduct] = useState(null);
  const [options, setOptions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!name) {
      setError("Product name is missings");
      return;
    }

    const fetchProduct = async () => {
      try {
        console.log("Fetching product by name:", name); // Added log
        const res = await fetch(`${API_BASE_URL}/api/products/name/${name}`);
        console.log("Fetched product data response status:", res.status); // Added log
        if (!res.ok) {
          const errorText = await res.text(); // Get more details on error
          throw new Error(`Product not found: ${res.status} ${errorText}`);
        }
        const data = await res.json();
        console.log("Fetched product data:", data); // Added log
        setProduct(data);

        console.log("Attempting to fetch options for product ID:", data.id); // Added log
        const optionsRes = await fetch(`${API_BASE_URL}/api/product_options/${data.id}`);
        console.log("Options fetch response status:", optionsRes.status); // Added log
        if (!optionsRes.ok) {
          if (optionsRes.status === 404) {
            console.warn("No options found for this product, setting options to empty array."); // Changed to warn
            setOptions([]); // Set empty array if 404
            return;
          }
          const optionsErrorText = await optionsRes.text();
          throw new Error(`Options not found: ${optionsRes.status} ${optionsErrorText}`);
        }
        const optionsData = await optionsRes.json();
        console.log("Fetched options data:", optionsData); // Added log
        setOptions(optionsData);
      } catch (err) {
        console.error("Error in fetchProduct:", err); // Added error log
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAll = async () => {
      try {
        console.log("Fetching all products for 'More like this' section."); // Added log
        const res = await fetch(`${API_BASE_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch all products");
        const data = await res.json();
        console.log("Fetched all products data:", data); // Added log
        setAllProducts(data);
      } catch (err) {
        console.error("Error fetching all products for 'More like this':", err); // Added console.error
        // Not setting error state for all products as it's not critical for main product display
      }
    };

    fetchProduct();
    fetchAll();
  }, [name]);

  const moreProducts = allProducts.filter((p) => p.name !== name).slice(0, 5);

  if (loading) return <div className="text-white p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!product) return <div className="text-white p-4">Product data is not available.</div>;

  const imageUrl = product.img
    ? `${API_BASE_URL}${
        product.img.startsWith("/images") ? product.img : "/images/" + product.img
      }`
    : "/images/default_image.png";

  return (
    <div className="bg-[#0e1117] min-h-screen text-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-8 flex flex-col md:flex-row gap-6 items-center justify-center">
        <img src={imageUrl} alt={product.name} className="max-h-32 object-contain" />
        <div className="text-center md:text-left max-w-xl">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-white text-sm mb-1">{product.description}</p>
          <p className="text-white text-xs">Instant Wallet Recharge · Redeemable Globally</p>
        </div>
      </div>

      {/* Price Options */}
      <div className="max-w-3xl mx-auto p-4">
        {options.length === 0 && (
          <p className="text-gray-400">No pricing options available.</p>
        )}
        {options.map((option) => (
          <div
            key={option.id}
            className="bg-[#1c222c] mb-3 p-4 rounded-xl flex justify-between items-center hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-12 h-12 rounded-md"
              />
              <div>
                <div className="text-sm font-semibold">
                  {product.name} - DT
                  {(() => {
                    console.log("Processing option:", option); // Log the entire option object
                    console.log("Type of option.price:", typeof option.price, "Value:", option.price); // Log price type and value

                    const parsed = parseFloat(option.price);
                    if (isNaN(parsed)) {
                      console.warn("WARN: Price is not a number or string type that can be parsed in option:", option); // More specific warning
                      return "N/A"; // Or handle as an error
                    }
                    console.log("Parsed option price (should be number):", parsed); // Log parsed value
                    return parsed.toFixed(2);
                  })()}
                  ({option.label})
                </div>
                <div className="text-xs text-gray-400">{option.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-white font-bold">
                DT
                {(() => {
                  const parsed = parseFloat(option.price);
                  if (isNaN(parsed)) {
                    console.warn("WARN: Price is not a number or string type that can be parsed for display:", option); // Another warning for display
                    return "N/A";
                  }
                  return parsed.toFixed(2);
                })()}
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={() => {
                  addToCart(option, product); // Add to cart using context function
                  navigate("/basket"); // Navigate to basket
                }}
              >
                <ShoppingCart size={16} /> Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* More like this */}
      {moreProducts.length > 0 && (
        <div className="max-w-4xl mx-auto p-4">
          <h2 className="text-xl font-semibold mb-4">More like this</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {moreProducts.map((p) => (
              <Link
                key={p.name}
                to={`/product/${p.name}`}
                className="bg-[#1c222c] p-4 rounded-xl hover:shadow-xl"
              >
                <img
                  src={`${API_BASE_URL}${
                    p.img?.startsWith("/images") ? p.img : "/images/" + p.img
                  }`}
                  alt={p.name}
                  className="w-full h-40 object-contain rounded-md mb-2"
                />
                <h3 className="text-white font-medium">{p.name}</h3>
                <p className="text-gray-400 text-sm">
                  {(() => {
                    const parsed = parseFloat(p.price);
                    if (isNaN(parsed)) {
                      console.warn("WARN: Invalid price for product in 'More like this':", p); // Added warning
                      return "Price N/A";
                    }
                    return `$${parsed.toFixed(2)}`;
                  })()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
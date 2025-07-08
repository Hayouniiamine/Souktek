// src/ProductPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./context/CartContext";
import API_BASE_URL from "../config"; // Ensure this is correctly configured for your deployed backend

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
      setError("Product name is missing");
      return;
    }

    const fetchProduct = async () => {
      try {
        console.log(`Fetching product from: ${API_BASE_URL}/api/products/name/${name}`);
        const res = await fetch(`${API_BASE_URL}/api/products/name/${name}`);
        if (!res.ok) {
          throw new Error(`Product not found: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log("Fetched product data:", data);
        setProduct(data);

        console.log(`Fetching options from: ${API_BASE_URL}/api/product_options/${data.id}`);
        const optionsRes = await fetch(`${API_BASE_URL}/api/product_options/${data.id}`);
        if (!optionsRes.ok) {
          throw new Error(`Options not found: ${optionsRes.status} ${optionsRes.statusText}`);
        }
        const optionsData = await optionsRes.json();
        console.log("Fetched options data:", optionsData);
        setOptions(optionsData);
      } catch (err) {
        console.error("Error fetching product or options:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAll = async () => {
      try {
        console.log(`Fetching all products from: ${API_BASE_URL}/api/products`);
        const res = await fetch(`${API_BASE_URL}/api/products`);
        if (!res.ok) {
          throw new Error(`Failed to fetch all products: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log("Fetched all products data:", data);
        setAllProducts(data);
      } catch (err) {
        console.error("Error fetching all products:", err);
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

  // Use API_BASE_URL for images as well
  const imageUrl = product.img
    ? `${API_BASE_URL}${
        product.img.startsWith("/images") ? product.img : "/images/" + product.img
      }`
    : "/images/default_image.png"; // Fallback for local development or if API_BASE_URL is not set

  return (
    <div className="bg-[#0e1117] min-h-screen text-white">
      {/* Hero */}
      <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-5xl font-bold">{product.name}</h1>
          <p className="text-lg mt-2">{product.description}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-semibold mb-4">Available Options</h2>
        {options.length === 0 && <p className="text-gray-400">No options available for this product.</p>}
        {options.map((option) => (
          <div key={option.id} className="bg-[#1c222c] p-4 rounded-xl mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">{option.label}</h3>
              <p className="text-gray-400">{option.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">
                {(() => {
                  console.log("Processing option:", option);
                  const parsed = parseFloat(option.price);
                  if (isNaN(parsed)) {
                    console.warn("WARN: option.price is not a valid number:", option.price, typeof option.price, option);
                    return "Price N/A"; // Or handle as an error
                  }
                  return `$${parsed.toFixed(2)}`;
                })()}
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={() => {
                  addToCart(option, product); // Add to cart using context function
                  navigate('/basket'); // Navigate to basket
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
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-gray-400 text-sm">{p.description}</p>
                <div className="text-xl font-bold mt-2">
                  {(() => {
                    console.log("Processing 'more like this' product:", p);
                    const parsed = parseFloat(p.price);
                    if (isNaN(parsed)) {
                      console.warn("WARN: p.price is not a valid number in 'More like this':", p.price, typeof p.price, p);
                      return "Price N/A";
                    }
                    return `$${parsed.toFixed(2)}`;
                  })()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
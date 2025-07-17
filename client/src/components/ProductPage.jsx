import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./context/CartContext";
import API_BASE_URL from "../config";

export default function ProductPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

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

    window.scrollTo(0, 0); // Scroll to top when navigating to another product

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/name/${name}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);

        const optionsRes = await fetch(`${API_BASE_URL}/api/product_options/${data.id}`);
        if (!optionsRes.ok) throw new Error("Options not found");
        const optionsData = await optionsRes.json();
        setOptions(optionsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAll = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch all products");
        const data = await res.json();
        setAllProducts(data);
      } catch (err) {
        console.error("Error fetching all products:", err);
      }
    };

    fetchProduct();
    fetchAll();
  }, [name]);

  const moreProducts = allProducts.filter((p) => p.name !== name).slice(0, 5);

  if (loading) return <div className="text-white p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!product) return <div className="text-white p-4">Product data is not available.</div>;

  // Fix for image URL supporting /images and /uploads folders
  const getFullImageUrl = (img) => {
    if (!img) return "/images/default_image.png";
    return `${API_BASE_URL}${
      img.startsWith("/images") || img.startsWith("/uploads") ? img : "/images/" + img
    }`;
  };

  const imageUrl = getFullImageUrl(product.img);

  return (
    <div className="bg-[#0e1117] min-h-screen text-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-8 flex flex-col md:flex-row gap-6 items-center justify-center">
        <img src={imageUrl} alt={product.name} className="max-h-32 object-contain" />
        <div className="text-center md:text-left max-w-xl">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-white text-sm mb-1">{product.description}</p>
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
                {/* MODIFIED LINE: Removed the price from this text */}
                <div className="text-sm font-semibold">
                  {product.name} ({option.label})
                </div>
                <div className="text-xs text-gray-400">{option.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-white font-bold">DT{Number(option.price).toFixed(2)}</div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={() => {
                  addToCart(option, product);

                  navigate('/basket');
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
            {moreProducts.map((p) => {
              const pImage = getFullImageUrl(p.img);

              return (
                <Link
                  key={p.name}
                  to={`/product/${p.name}`}
                  className="bg-[#1c222c] p-4 rounded-xl hover:shadow-xl"
                >
                  <img
                    src={pImage}
                    alt={p.name}
                    className="w-full h-40 object-contain rounded-md mb-2"
                  />
                  <h3 className="text-white font-medium">{p.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
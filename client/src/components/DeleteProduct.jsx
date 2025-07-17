import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../config'; // Assuming config.js is in the parent directory

const DeleteProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [types, setTypes] = useState([]);

  // Fetch all types on mount
  useEffect(() => {
    const fetchAllTypes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        const data = await res.json();
        setTypes(Array.from(new Set(data.map(p => p.type))).filter(Boolean));
      } catch (error) {
        console.error("Error fetching product types:", error);
      }
    };
    fetchAllTypes();
  }, []);

  // Fetch products when filterType changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `${API_BASE_URL}/api/products`;
        if (filterType !== "all") {
          url = `${API_BASE_URL}/api/products/type/${encodeURIComponent(filterType)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]); // clear products on error
      }
    };

    fetchProducts();
  }, [filterType]);

  // Helper to get full image URL
  const getFullImageUrl = (img) => {
    if (!img) return "/images/default_image.png";
    return `${API_BASE_URL}${
      img.startsWith("/images") || img.startsWith("/uploads") ? img : "/images/" + img
    }`;
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token missing. Please log in.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          alert("✅ Product deleted successfully!");
          // Remove the deleted product locally
          setProducts(products.filter((product) => product.id !== id));
          navigate("/admin-dashboard");
        } else {
          const errorData = await response.json();
          alert(`❌ Error deleting product: ${errorData.message || response.statusText}`);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("❌ Network error or server is unreachable.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-black mb-10">
          Delete Products
        </h1>

        <div className="mb-6 flex justify-center">
          <select
            onChange={(e) => setFilterType(e.target.value)}
            value={filterType}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="all">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
              >
                <div className="w-full h-40 flex items-center justify-center bg-gray-200">
                  <img
                    src={getFullImageUrl(product.img)}
                    alt={product.name}
                    className="max-h-32 object-contain"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-black">{product.name}</h3>
                  <p className="text-sm text-black flex-1">{product.description}</p>
                  <p className="text-black font-bold mt-2">{product.price}</p>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-black">No products available.</p>
        )}
      </div>
    </div>
  );
};

export default DeleteProduct;

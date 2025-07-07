import React, { useState, useEffect } from "react";
import { API_BASE_URL } from '../config'; // Assuming config.js is in the parent directory

const DeleteProduct = () => {
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        setProducts(data);

        // Extract unique product types, ignoring falsy values
        const uniqueTypes = Array.from(new Set(data.map((p) => p.type))).filter(Boolean);
        setTypes(uniqueTypes);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by selected type or show all
  const filteredProducts =
    filterType === "all"
      ? products
      : products.filter((product) => product.type === filterType);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          alert("✅ Product deleted successfully!");
          // Remove the deleted product from the state
          setProducts(products.filter((product) => product.id !== id));
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
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Delete Products
        </h1>

        {/* Filter dropdown */}
        <div className="mb-6 flex justify-center">
          <select
            onChange={(e) => setFilterType(e.target.value)}
            value={filterType}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
              >
                <div className="w-full h-40 flex items-center justify-center bg-gray-200">
                  <img
                    src={
                      product.img
                        ? `${API_BASE_URL}${
                            product.img.startsWith("/images")
                              ? product.img
                              : "/images/" + product.img
                          }`
                        : "/images/default_image.png"
                    }
                    alt={product.name}
                    className="max-h-32 object-contain"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm flex-1">{product.description}</p>
                  <p className="text-indigo-600 font-bold mt-2">{product.price}</p>
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
          <p className="text-center text-gray-600">No products available.</p>
        )}
      </div>
    </div>
  );
};

export default DeleteProduct;
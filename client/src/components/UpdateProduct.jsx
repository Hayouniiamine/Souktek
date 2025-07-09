import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../config';
import { getImageUrl } from '../utils/imageHelper'; // ✅ Import helper

const UpdateProduct = () => {
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);

      const uniqueTypes = Array.from(new Set(data.map((p) => p.type))).filter(Boolean);
      setTypes(uniqueTypes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts =
    filterType === "all"
      ? products
      : products.filter((product) => product.type === filterType);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Update Products
        </h1>

        {/* Filter dropdown */}
        <div className="mb-6 flex justify-center">
          <label htmlFor="filterType" className="mr-3 font-semibold text-black">
            Filter by type:
          </label>
          <select
            id="filterType"
            onChange={(e) => setFilterType(e.target.value)}
            value={filterType}
            className="p-2 border border-gray-300 rounded-md shadow-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="text-center text-black">Loading...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col p-4"
            >
              {/* ✅ Use getImageUrl for image rendering */}
              <div className="flex justify-center bg-gray-200 p-4 rounded mb-4">
                <img
                  src={getImageUrl(product.img)}
                  alt={product.name}
                  className="max-h-40 object-contain"
                />
              </div>

              {/* Product Info */}
              <h3 className="text-xl font-semibold text-black mb-2">{product.name}</h3>
              <p className="text-gray-700 text-sm flex-grow">{product.description}</p>
              <p className="text-black font-bold mt-2">DT {product.price}</p>
              <p className="text-gray-700 text-xs mt-1">Type: {product.type}</p>

              {/* Update Button */}
              <button
                onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition duration-300"
                aria-label={`Update product ${product.name}`}
              >
                Update Product
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;

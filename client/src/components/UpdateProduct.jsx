import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UpdateProduct = () => {
  const [products, setProducts] = useState([]);
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
      const res = await fetch("http://localhost:5000/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const productsData = await res.json();

      setProducts(productsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">Products</h1>

        {loading && <p className="text-center text-gray-600">Loading...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col"
            >
              {/* Product Image */}
              <div className="flex justify-center bg-gray-200 p-4 rounded mb-4">
                <img
                  src={
                    product.img
                      ? `http://localhost:5000${
                          product.img.startsWith("/images")
                            ? product.img
                            : "/images/" + product.img
                        }`
                      : "/images/default_image.png"
                  }
                  alt={product.name}
                  className="max-h-40 object-contain"
                />
              </div>

              {/* Product basic info */}
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm flex-grow">{product.description}</p>
              <p className="text-indigo-600 font-bold mt-2">DT {product.price}</p>
              <p className="text-gray-500 text-xs mt-1">Type: {product.type}</p>

              {/* Update button at bottom of card */}
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

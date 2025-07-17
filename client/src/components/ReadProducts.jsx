import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

// Helper to normalize type strings: lowercase, remove underscores/spaces
const normalizeTypeString = (str) =>
  str.toLowerCase().replace(/[_\s]/g, '');

const ReadProducts = () => {
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        const data = await res.json();

        const normalizedProducts = data.map((p) => ({
          ...p,
          type: Array.isArray(p.type)
            ? p.type.map(normalizeTypeString)
            : [normalizeTypeString(String(p.type))],
        }));

        setProducts(normalizedProducts);

        const uniqueTypes = Array.from(
          new Set(normalizedProducts.flatMap((p) => p.type))
        );
        setTypes(uniqueTypes);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  const filteredProducts =
    filterType === 'all'
      ? products
      : products.filter((product) => product.type.includes(filterType));

  const getFullImageUrl = (img) => {
    if (!img) return '/images/default_image.png';
    return `${API_BASE_URL}${
      img.startsWith('/images') || img.startsWith('/uploads') ? img : '/images/' + img
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">All Products</h1>

        {/* Filter dropdown */}
        <div className="mb-6 flex justify-center">
          <label htmlFor="filter" className="mr-3 font-semibold text-gray-900">
            Filter by type:
          </label>
          <select
            id="filter"
            value={filterType}
            onChange={handleFilterChange}
            className="p-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
          >
            <option value="all">All</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
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
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{product.name}</h3>
                  <p className="text-gray-700 text-sm flex-1">{product.description}</p>
                  <p className="text-green-800 font-bold mt-2">TND {product.price}</p>
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

export default ReadProducts;

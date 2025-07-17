import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

const ReadProducts = () => {
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url =
          filterType === 'all'
            ? `${API_BASE_URL}/api/products`
            : `${API_BASE_URL}/api/products?type=${encodeURIComponent(filterType)}`;

        const response = await fetch(url);
        const data = await response.json();
        setProducts(data);

        if (filterType === 'all') {
          // Get unique product types
          const allTypes = Array.from(
            new Set(data.flatMap((p) => (Array.isArray(p.type) ? p.type : [p.type])))
          ).filter(Boolean);
          setTypes(allTypes);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [filterType]);

  // Only update filterType if the selected type exists or is "all"
  const handleFilterChange = (e) => {
    const selected = e.target.value;
    if (selected === 'all' || types.includes(selected)) {
      setFilterType(selected);
    } else {
      // Optionally, ignore or reset to 'all' if invalid selection
      setFilterType('all');
    }
  };

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
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
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

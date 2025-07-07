import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import  API_BASE_URL  from '../config';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    price: "",
    img: "",
    description: "",
  });
  const [options, setOptions] = useState([]);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edited options state keyed by option id
  const [editedOptions, setEditedOptions] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const productRes = await fetch(`${API_BASE_URL}/api/products/${id}`);
        if (!productRes.ok) throw new Error("Product not found");
        const productData = await productRes.json();
        setProduct(productData);

        const optionsRes = await fetch(
          `${API_BASE_URL}/api/product_options/${id}`
        );
        if (!optionsRes.ok) throw new Error("Failed to load options");
        const optionsData = await optionsRes.json();
        setOptions(optionsData);

        // Initialize editedOptions state
        const initEditedOptions = {};
        optionsData.forEach((opt) => {
          initEditedOptions[opt.id] = {
            label: opt.label,
            price: opt.price,
            description: opt.description,
          };
        });
        setEditedOptions(initEditedOptions);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching product or options:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (optionId, field, value) => {
    setEditedOptions((prev) => ({
      ...prev,
      [optionId]: {
        ...prev[optionId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token missing. Please log in.');
      navigate('/login');
      return;
    }

    // Prepare product data
    const productFormData = new FormData();
    productFormData.append("name", product.name);
    productFormData.append("price", product.price);
    productFormData.append("description", product.description);
    if (image) {
      productFormData.append("image", image);
    }

    try {
      // Update product details
      const productRes = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: productFormData, // FormData for multipart/form-data
      });

      if (!productRes.ok) {
        const errorText = await productRes.text();
        throw new Error(`Failed to update product: ${productRes.status} - ${errorText}`);
      }

      // Update product options
      // Send each option update individually or as a batch if API supports
      await Promise.all(
        Object.entries(editedOptions).map(([optionId, optionData]) =>
          fetch(`${API_BASE_URL}/api/product_options/${optionId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(optionData),
          })
            .then(res => {
              if (!res.ok) {
                return res.text().then(text => { throw new Error(`Failed to update option ${optionId}: ${res.status} - ${text}`); });
              }
              return res.json();
            })
        )
      );

      alert("Product and options updated successfully!");
      navigate("/admin/update-product"); // Navigate back to the update product list
    } catch (err) {
      setError(err.message);
      console.error("Error updating product or options:", err);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading product details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Edit Product: {product.name}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Product Basic Details */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Details</h2>
            <div className="mb-4">
              <label htmlFor="name" className="block font-semibold text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name}
                onChange={handleProductChange}
                className={inputClass}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="price" className="block font-semibold text-gray-700 mb-1">
                Base Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={product.price}
                onChange={handleProductChange}
                step="0.01"
                className={inputClass}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleProductChange}
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="image" className="block font-semibold text-gray-700 mb-1">
                Product Image
              </label>
              <input
                type="file"
                id="image"
                className="w-full text-gray-700 border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                onChange={(e) => setImage(e.target.files[0])}
              />
              {product.img && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                  <img
                    src={`${API_BASE_URL}${
                      product.img.startsWith('/images') ? product.img : '/images/' + product.img
                    }`}
                    alt="Current Product"
                    className="max-h-40 object-contain rounded-lg shadow"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Product Options Section */}
          <div className="mb-6 border-t pt-6 mt-6 border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Options</h2>
            {options.length === 0 && <p className="text-gray-600">No options found for this product.</p>}
            {options.map((opt) => (
              <div key={opt.id} className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
                <h3 className="text-xl font-bold mb-3">Option: {opt.label}</h3>
                <div className="mb-4">
                  <label className="block font-semibold text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={editedOptions[opt.id]?.label ?? ""}
                    onChange={(e) =>
                      handleOptionChange(opt.id, "label", e.target.value)
                    }
                    placeholder="Option label"
                    className={inputClass}
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-semibold text-gray-700 mb-1">
                    Price (DT)
                  </label>
                  <input
                    type="text" // changed to text to allow flexible price input
                    value={editedOptions[opt.id]?.price ?? ""}
                    onChange={(e) =>
                      handleOptionChange(opt.id, "price", e.target.value)
                    }
                    placeholder="Option price (e.g. DT5.00)"
                    className={inputClass}
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editedOptions[opt.id]?.description || ""}
                    onChange={(e) =>
                      handleOptionChange(opt.id, "description", e.target.value)
                    }
                    placeholder="Option description"
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Unified Update Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-300"
          >
            Update Product & Options
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
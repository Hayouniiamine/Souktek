import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    price: "",
    img: "",
    description: "",
    type: [], // changed to array to store multiple types
  });
  const [options, setOptions] = useState([]);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editedOptions, setEditedOptions] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const productRes = await fetch(`${API_BASE_URL}/api/products/${id}`);
        if (!productRes.ok) throw new Error("Product not found");
        const productData = await productRes.json();

        // Ensure type is array (it comes as array from backend)
        setProduct({
          ...productData,
          type: Array.isArray(productData.type) ? productData.type : [],
        });

        const optionsRes = await fetch(`${API_BASE_URL}/api/product_options/${id}`);
        if (!optionsRes.ok) throw new Error("Failed to load options");
        const optionsData = await optionsRes.json();
        setOptions(optionsData);

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

  // New handler for checkbox toggle
  const handleTypeToggle = (typeValue) => {
    setProduct((prev) => {
      const currentTypes = prev.type || [];
      if (currentTypes.includes(typeValue)) {
        // Remove type
        return { ...prev, type: currentTypes.filter((t) => t !== typeValue) };
      } else {
        // Add type
        return { ...prev, type: [...currentTypes, typeValue] };
      }
    });
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

  const handleDeleteOption = async (optionId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required.");

    if (!window.confirm("Are you sure you want to delete this option?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/product_options/${optionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to delete option: ${res.status} - ${text}`);
      }

      setOptions((prev) => prev.filter((opt) => opt.id !== optionId));
      const newEditedOptions = { ...editedOptions };
      delete newEditedOptions[optionId];
      setEditedOptions(newEditedOptions);

      alert("✅ Option deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Error deleting option.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation: at least one type selected
    if (!product.type || product.type.length === 0) {
      alert("Please select at least one product type.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing. Please log in.");
      navigate("/login");
      return;
    }

    const productFormData = new FormData();
    productFormData.append("name", product.name);
    productFormData.append("price", product.price);
    productFormData.append("description", product.description);
    productFormData.append("type", JSON.stringify(product.type)); // send as JSON string
    if (image) productFormData.append("image", image);

    try {
      const productRes = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: productFormData,
      });

      if (!productRes.ok) {
        const errorText = await productRes.text();
        throw new Error(`Failed to update product: ${productRes.status} - ${errorText}`);
      }

      await Promise.all(
        Object.entries(editedOptions).map(([optionId, optionData]) =>
          fetch(`${API_BASE_URL}/api/product_options/${optionId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(optionData),
          }).then((res) => {
            if (!res.ok) {
              return res.text().then((text) => {
                throw new Error(`Failed to update option ${optionId}: ${res.status} - ${text}`);
              });
            }
            return res.json();
          })
        )
      );

      alert("Product and options updated successfully!");
      navigate("/admin/update-product");
    } catch (err) {
      setError(err.message);
      console.error("Error updating product or options:", err);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500";

  // Helper to fix image URL for display
  const getFullImageUrl = (img) => {
    if (!img) return null;
    return `${API_BASE_URL}${img.startsWith("/images") || img.startsWith("/uploads") ? img : "/images/" + img}`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-600">
        Error: {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Edit Product: {product.name}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* === Product Basic Fields === */}
          <div className="mb-6">
            <div className="mb-4">
              <label className="block font-semibold text-black mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleProductChange}
                className={inputClass}
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-black mb-1">Price Range</label>
              <input
                type="text"
                name="price"
                value={product.price}
                onChange={handleProductChange}
                className={inputClass}
              />
            </div>

            {/* === New Types checkboxes === */}
            <div className="mb-4">
              <label className="block font-semibold text-black mb-1">Product Type</label>

              {product.type.includes("top") && (
                <p className="text-sm mb-2 text-indigo-700 font-semibold">
                  When you add "top" as a type it appears above.
                </p>
              )}

              <div className="flex gap-4">
                {["games", "gift_cards", "top"].map((typeValue) => (
                  <label key={typeValue} className="inline-flex items-center gap-2 text-black select-none">
                    <input
                      type="checkbox"
                      checked={product.type.includes(typeValue)}
                      onChange={() => handleTypeToggle(typeValue)}
                      className="w-5 h-5"
                    />
                    <span className="capitalize">{typeValue.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-black mb-1">Description</label>
              <textarea
                rows={4}
                name="description"
                value={product.description}
                onChange={handleProductChange}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold text-black mb-1">Product Image</label>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="text-black"
              />
              {product.img && (
                <div className="mt-3">
                  <img
                    src={getFullImageUrl(product.img)}
                    alt="Current"
                    className="max-h-40 rounded shadow"
                  />
                </div>
              )}
            </div>
          </div>

          {/* === Options === */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Options</h2>
            {options.length === 0 ? (
              <p className="text-gray-700">No options for this product.</p>
            ) : (
              options.map((opt) => (
                <div
                  key={opt.id}
                  className="bg-gray-50 p-4 mb-4 rounded-lg shadow-sm"
                >
                  <h3 className="text-xl font-bold mb-3 text-black">
                    Option: {opt.label}
                  </h3>

                  <div className="mb-2">
                    <label className="block font-semibold text-black mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={editedOptions[opt.id]?.label ?? ""}
                      onChange={(e) =>
                        handleOptionChange(opt.id, "label", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block font-semibold text-black mb-1">
                      Price (DT)
                    </label>
                    <input
                      type="text"
                      value={editedOptions[opt.id]?.price ?? ""}
                      onChange={(e) =>
                        handleOptionChange(opt.id, "price", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block font-semibold text-black mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={editedOptions[opt.id]?.description ?? ""}
                      onChange={(e) =>
                        handleOptionChange(opt.id, "description", e.target.value)
                      }
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteOption(opt.id)}
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    🗑️ Delete Option
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg mt-6"
          >
            Update Product & Options
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;

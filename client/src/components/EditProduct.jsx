import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const POSSIBLE_TYPES = [
  { value: "gift_cards", label: "Gift Cards" },
  { value: "games", label: "Games" },
  // Add more types here if needed
];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    price: "",
    img: "",
    description: "",
    type: [], // now an array of strings
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

        // Convert type field to array if necessary
        let typesArray = [];
        if (Array.isArray(productData.type)) {
          typesArray = productData.type;
        } else if (typeof productData.type === "string" && productData.type.trim() !== "") {
          // If backend sends a comma-separated string, parse it
          typesArray = productData.type.split(",").map((t) => t.trim());
        }

        setProduct({ ...productData, type: typesArray });

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

  const handleTypeChange = (typeValue) => {
    setProduct((prev) => {
      let newTypes;
      if (prev.type.includes(typeValue)) {
        newTypes = prev.type.filter((t) => t !== typeValue);
      } else {
        newTypes = [...prev.type, typeValue];
      }
      return { ...prev, type: newTypes };
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
    // Send type as JSON string
    productFormData.append("type", JSON.stringify(product.type));
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
    return `${API_BASE_URL}${
      img.startsWith("/images") || img.startsWith("/uploads") ? img : "/images/" + img
    }`;
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

            <div className="mb-4">
              <label className="block font-semibold text-black mb-1">Product Type</label>
              <div className="flex gap-4">
                {POSSIBLE_TYPES.map(({ value, label }) => (
                  <label key={value} className="inline-flex items-center text-black">
                    <input
                      type="checkbox"
                      checked={product.type.includes(value)}
                      onChange={() => handleTypeChange(value)}
                      className="mr-2"
                    />
                    {label}
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
                    className="max-w-xs rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* === Product Options === */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Product Options</h2>

            {options.length === 0 && <p>No options found for this product.</p>}

            {options.map((option) => (
              <div
                key={option.id}
                className="mb-6 p-4 bg-gray-200 rounded-lg border border-gray-300"
              >
                <label className="block font-semibold text-black mb-1">Label</label>
                <input
                  type="text"
                  value={editedOptions[option.id]?.label || ""}
                  onChange={(e) => handleOptionChange(option.id, "label", e.target.value)}
                  className={inputClass}
                />

                <label className="block font-semibold text-black mt-4 mb-1">Price</label>
                <input
                  type="text"
                  value={editedOptions[option.id]?.price || ""}
                  onChange={(e) => handleOptionChange(option.id, "price", e.target.value)}
                  className={inputClass}
                />

                <label className="block font-semibold text-black mt-4 mb-1">Description</label>
                <textarea
                  value={editedOptions[option.id]?.description || ""}
                  onChange={(e) => handleOptionChange(option.id, "description", e.target.value)}
                  className={`${inputClass} resize-none`}
                  rows={3}
                />

                <button
                  type="button"
                  onClick={() => handleDeleteOption(option.id)}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                >
                  Delete Option
                </button>
              </div>
            ))}
          </div>

          {/* === Submit Button and Error === */}
          {error && (
            <p className="text-red-600 text-center font-semibold mb-4">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-300"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;

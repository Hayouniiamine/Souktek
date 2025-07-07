import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
        const productRes = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!productRes.ok) throw new Error("Product not found");
        const productData = await productRes.json();
        setProduct(productData);

        const optionsRes = await fetch(
          `http://localhost:5000/api/product_options/${id}`
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
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle option input changes locally
  const handleOptionChange = (optionId, field, value) => {
    setEditedOptions((prev) => ({
      ...prev,
      [optionId]: {
        ...prev[optionId],
        [field]: value,
      },
    }));
  };

  // Unified submit handler: update product AND all options
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Update main product
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price); // string, accepts ranges or number
      formData.append("description", product.description);
      if (image) {
        formData.append("image", image);
      }

      const productRes = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!productRes.ok) throw new Error("Failed to update product");

      // Update all product options in parallel
      const optionUpdatePromises = Object.entries(editedOptions).map(
        async ([optionId, optionData]) => {
          const body = {
            label: optionData.label,
            price: optionData.price, // keep as string, backend must handle parsing
            description: optionData.description,
          };
          const res = await fetch(
            `http://localhost:5000/api/product_options/${optionId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }
          );
          if (!res.ok) throw new Error(`Failed to update option ${optionId}`);
          return res.json();
        }
      );

      await Promise.all(optionUpdatePromises);

      alert("✅ Product and options updated successfully!");
      navigate("/admin-dashboard");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error) return <p className="text-center text-red-600 mt-8">{error}</p>;

  // Shared style for placeholders in black
  const inputClass =
    "w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-black";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 overflow-auto max-h-[90vh]">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Edit Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              className={inputClass}
              value={product.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Product Price (text input for ranges or numbers) */}
          <div>
            <label className="block text-gray-700 mb-2">
              Price (e.g. DT14.46 - DT289.2 or 14.46)
            </label>
            <input
              type="text"
              name="price"
              className={inputClass}
              value={product.price}
              onChange={handleInputChange}
              placeholder="DT14.46 - DT289.2 or just number"
              required
            />
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              className={`${inputClass} resize-none`}
              value={product.description}
              onChange={handleInputChange}
              placeholder="Enter description"
              rows={4}
              required
            />
          </div>

          {/* Image Preview */}
          {product.img && (
            <div className="mb-4">
              <img
                src={
                  product.img.startsWith("/images")
                    ? `http://localhost:5000${product.img}`
                    : `http://localhost:5000/images/${product.img}`
                }
                alt={product.name}
                className="max-h-32 object-contain"
              />
            </div>
          )}

          {/* Product Image Upload */}
          <div>
            <label className="block text-gray-700 mb-2">Product Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={handleImageChange}
            />
          </div>

          {/* Product Options Section */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-gray-700">
              Product Options
            </h3>
            {options.length === 0 && (
              <p className="text-gray-500">No options available for this product.</p>
            )}
            {options.map((opt) => (
              <div
                key={opt.id}
                className="border rounded-lg p-4 mb-6 bg-gray-50"
                style={{ boxShadow: "0 0 6px #ccc" }}
              >
                <div className="mb-4">
                  <label className="block font-semibold text-gray-700 mb-1">Label</label>
                  <input
                    type="text"
                    value={editedOptions[opt.id]?.label || ""}
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

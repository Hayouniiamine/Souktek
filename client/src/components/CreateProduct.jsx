import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [type, setType] = useState('gift_cards'); // <-- exact string used

  // Options: array of { label, price, description }
  const [options, setOptions] = useState([]);

  // For new option inputs
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState('');
  const [newOptionDescription, setNewOptionDescription] = useState('');

  // Add option to options list
  const addOption = () => {
    if (!newOptionLabel || !newOptionPrice || !newOptionDescription) {
      alert('Please fill all fields to add an option');
      return;
    }
    setOptions((prev) => [
      ...prev,
      {
        label: newOptionLabel,
        price: newOptionPrice,
        description: newOptionDescription,
      },
    ]);
    // Reset new option inputs
    setNewOptionLabel('');
    setNewOptionPrice('');
    setNewOptionDescription('');
  };

  // Remove option by index
  const removeOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('type', type);
    if (image) formData.append('image', image);

    // Append options as JSON string
    formData.append('options', JSON.stringify(options));

    // Debug log form data before sending
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('✅ Product created successfully!');
        navigate('/admin-dashboard');
      } else {
        alert('❌ Error creating product');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error creating product');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Create New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Fields */}
          <div>
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Price (e.g. $5 - $100)</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Product Type</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="gift_cards">Gift Cards</option> {/* EXACT string */}
              <option value="games">Games</option> {/* EXACT string */}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Product Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </div>

          {/* Options Section */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Product Options</h3>

            {/* Existing Options List */}
            {options.length > 0 && (
              <ul className="mb-4 max-h-40 overflow-auto border rounded p-2">
                {options.map((opt, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center mb-2 border-b pb-1 last:border-b-0"
                  >
                    <div>
                      <p><strong>Label:</strong> {opt.label}</p>
                      <p><strong>Price:</strong> {opt.price}</p>
                      <p><strong>Description:</strong> {opt.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="ml-4 text-red-500 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add New Option Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 mb-1">Option Label</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Option Price</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                  value={newOptionPrice}
                  onChange={(e) => setNewOptionPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Option Description</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                  value={newOptionDescription}
                  onChange={(e) => setNewOptionDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <button
                type="button"
                onClick={addOption}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-300"
              >
                Add Option
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-300"
          >
            Create Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;

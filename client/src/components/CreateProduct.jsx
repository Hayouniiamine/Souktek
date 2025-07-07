import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL  from '../config';

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

    if (image) {
      formData.append('image', image);
    }

    // Append options as a JSON string
    formData.append('options', JSON.stringify(options));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token missing. Please log in.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('Product created successfully!');
        navigate('/admin/products'); // Redirect to product list or admin dashboard
      } else {
        const errorData = await response.json();
        alert(`Failed to create product: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('An error occurred while creating the product.');
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700";
  const labelClass = "block text-gray-700 text-sm font-bold mb-1";

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Create New Product
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Basic Details */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Product Name
            </label>
            <input
              type="text"
              id="name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="price" className={labelClass}>
              Base Price (DT)
            </label>
            <input
              type="number"
              id="price"
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div>
            <label htmlFor="image" className={labelClass}>
              Product Image
            </label>
            <input
              type="file"
              id="image"
              className="w-full text-gray-700 border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <div>
            <label htmlFor="type" className={labelClass}>
              Product Type
            </label>
            <select
              id="type"
              className={inputClass}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="gift_cards">Gift Card</option>
              <option value="games">Game</option>
              <option value="software">Software</option>
              {/* Add more types as needed */}
            </select>
          </div>

          {/* Product Options Section */}
          <div className="border-t pt-6 mt-6 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Options</h2>
            {options.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-3"
              >
                <div>
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-sm text-gray-600">
                    DT {parseFloat(option.price).toFixed(2)} - {option.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full text-sm"
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold mb-3">Add New Option</h3>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Option Label</label>
                <input
                  type="text"
                  className={inputClass}
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Option Price</label>
                <input
                  type="text"
                  className={inputClass}
                  value={newOptionPrice}
                  onChange={(e) => setNewOptionPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Option Description</label>
                <textarea
                  className={inputClass}
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
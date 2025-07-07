import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from "./context/CartContext";
import { API_BASE_URL } from '../config';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotalPrice, clearCart } = useCart();

  const paymentMethods = [
    { id: "ooredoo", name: "Carte recharge Ooredoo" },
    { id: "orange", name: "Carte recharge Orange" },
    { id: "telecom", name: "Carte recharge Telecom" },
    { id: "d17", name: "D17" },
    { id: "flouci", name: "Flouci" },
  ];

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [email, setEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  const subtotal = getCartTotalPrice();

  const calculateServiceFee = () => {
    // Fees are removed, so the service fee is always 0
    return 0;
  };

  const serviceFee = calculateServiceFee();
  const total = subtotal + serviceFee;

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/');
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [cart, navigate]);

  const handlePaymentMethodChange = (methodId) => {
    setSelectedPaymentMethod(methodId);
    setShowPaymentDetails(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod || !email || !whatsappPhone || !transactionNumber) {
      alert("Please fill in all details and select a payment method.");
      return;
    }

    const orderDetails = {
      user_email: email, // Changed from user_id to user_email
      whatsapp_phone: whatsappPhone,
      transaction_number: transactionNumber,
      payment_method: selectedPaymentMethod,
      total_amount: total,
      products: cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        option_label: item.selectedOption?.label,
        quantity: item.quantity,
        price_at_purchase: item.selectedOption // Use selectedOption for price
          ? parseFloat(item.selectedOption.price)
          : parseFloat(item.price),
      })),
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderDetails),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Order placed successfully! " + data.message);
        clearCart(); // Clear the cart after successful order
        navigate("/success"); // Redirect to a success page
      } else {
        const errorData = await response.json();
        alert(`Failed to place order: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred while placing your order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1117] font-sans text-[#e0e0e0] flex flex-col items-center">
      <Navbar />

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl px-5 py-10 items-start flex-grow">
        {/* Left Column: Order Summary */}
        <div className="flex-1 bg-[#1a1d22] p-6 rounded-xl shadow-lg w-full">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Order Summary</h2>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
              <div>
                <p className="text-lg font-semibold">{item.name}</p>
                {item.selectedOption && (
                  <p className="text-sm text-gray-400">
                    Option: {item.selectedOption.label}
                  </p>
                )}
                <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
              </div>
              <p className="text-lg font-bold text-green-400">
                DT{" "}
                {(
                  item.quantity *
                  (item.selectedOption
                    ? parseFloat(item.selectedOption.price)
                    : parseFloat(item.price))
                ).toFixed(2)}
              </p>
            </div>
          ))}

          <div className="mt-6 pt-4 border-t border-gray-600">
            <div className="flex justify-between text-lg font-semibold mb-2">
              <span>Subtotal:</span>
              <span>DT {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold mb-2">
              <span>Service Fee:</span>
              <span>DT {serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-green-300 pt-3 border-t border-gray-600">
              <span>Total:</span>
              <span>DT {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Details */}
        <div className="flex-1 bg-[#1a1d22] p-6 rounded-xl shadow-lg w-full">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Payment Details</h2>

          {/* User Email Input */}
          <div className="mb-5">
            <label htmlFor="email" className="block text-gray-300 mb-1 text-sm">Your Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2.5 rounded-md border border-[#333] bg-[#1a1d22] text-[#e0e0e0] text-sm box-border focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 text-sm">Select Payment Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodChange(method.id)}
                  className={`p-3 rounded-md text-sm font-medium transition-all duration-200 
                    ${selectedPaymentMethod === method.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-[#2a2f36] text-gray-300 hover:bg-[#3a404a] hover:text-white"
                    }`}
                >
                  {method.name}
                </button>
              ))}
            </div>
          </div>

          {showPaymentDetails && (
            <div className="mt-6 p-5 bg-[#2a2f36] rounded-lg shadow-inner">
              <h3 className="text-xl font-semibold mb-4 text-blue-300">Complete Your Payment</h3>
              <p className="text-gray-300 mb-4 text-sm">
                Please send the total amount to the following details for your selected method:
              </p>
              {selectedPaymentMethod === "ooredoo" && (
                <div className="bg-[#1e2228] p-4 rounded-md text-sm mb-4">
                  <p><strong>Ooredoo Recharge:</strong> 20 563 760</p>
                  <p className="text-gray-400">Please send a recharge card for DT {total.toFixed(2)}</p>
                </div>
              )}
              {selectedPaymentMethod === "orange" && (
                <div className="bg-[#1e2228] p-4 rounded-md text-sm mb-4">
                  <p><strong>Orange Recharge:</strong> 55 000 000</p>
                  <p className="text-gray-400">Please send a recharge card for DT {total.toFixed(2)}</p>
                </div>
              )}
              {selectedPaymentMethod === "telecom" && (
                <div className="bg-[#1e2228] p-4 rounded-md text-sm mb-4">
                  <p><strong>Telecom Recharge:</strong> 97 000 000</p>
                  <p className="text-gray-400">Please send a recharge card for DT {total.toFixed(2)}</p>
                </div>
              )}
              {selectedPaymentMethod === "d17" && (
                <div className="bg-[#1e2228] p-4 rounded-md text-sm mb-4">
                  <p><strong>D17 Mobile Transfer:</strong> 20 563 760</p>
                  <p className="text-gray-400">Transfer DT {total.toFixed(2)} via D17</p>
                </div>
              )}
              {selectedPaymentMethod === "flouci" && (
                <div className="bg-[#1e2228] p-4 rounded-md text-sm mb-4">
                  <p><strong>Flouci Mobile Transfer:</strong> 20 563 760</p>
                  <p className="text-gray-400">Transfer DT {total.toFixed(2)} via Flouci</p>
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="whatsappPhone" className="block text-gray-300 mb-1 text-sm">Your WhatsApp / Phone Number</label>
                <input
                  type="text"
                  id="whatsappPhone"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="Enter your WhatsApp or phone number"
                  className="w-full p-2.5 rounded-md border border-[#333] bg-[#1a1d22] text-[#e0e0e0] text-sm box-border focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-5">
                <label htmlFor="transactionNumber" className="block text-gray-300 mb-1 text-sm">Number of Transaction Sent</label>
                <input
                  type="text"
                  id="transactionNumber"
                  value={transactionNumber}
                  onChange={(e) => setTransactionNumber(e.target.value)}
                  placeholder="Enter transaction reference"
                  className="w-full p-2.5 rounded-md border border-[#333] bg-[#1a1d22] text-[#e0e0e0] text-sm box-border focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-green-600 border-none py-3 rounded-md font-semibold text-base text-white cursor-pointer uppercase tracking-wider transition-colors duration-200 hover:bg-green-700"
              >
                Place Order
              </button>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
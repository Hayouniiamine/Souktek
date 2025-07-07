// src/components/Basket.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from './Footer';
import Navbar from './Navbar';
import { useCart } from "./context/CartContext";
import { API_BASE_URL } from '../config';

const Basket = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotalPrice } = useCart();

  const subtotal = getCartTotalPrice();
  const total = subtotal;

  if (cart.length === 0)
    return (
      <div className="min-h-screen bg-[#0e1117] text-[#8a95aa] font-['Segoe_UI',_Tahoma,_Geneva,_Verdana,_sans-serif] flex flex-col items-center text-2xl font-semibold">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          Your basket is empty.
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0e1117] font-['Segoe_UI',_Tahoma,_Geneva,_Verdana,_sans-serif] p-0 flex flex-col items-center">
      <Navbar />

      <div className="flex flex-col md:flex-row gap-5 w-full max-w-5xl px-5 py-10 items-start">
        {/* Left Column: Shopping Cart Items */}
        <div className="flex flex-col gap-5 flex-grow md:w-2/3 w-full">
          {/* Continue Shopping */}
          <div
            className="text-blue-500 text-base font-medium mb-2 cursor-pointer self-start"
            onClick={() => navigate("/")}
          >
            &#x2190; Continue Shopping
          </div>

          <div className="text-white text-2xl font-semibold flex items-center gap-2 mb-5">
            <span className="text-3xl inline-block -translate-y-px">
              &#128722;
            </span>{" "}
            Shopping Cart
          </div>

          {cart.map((item) => (
            <div
              key={item.cartItemId}
              className="bg-[#22252a] rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md"
            >
              <div className="w-20 h-20 bg-[#1a1d22] rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src={
                    item.img
                      ? `${API_BASE_URL}${
                          item.img.startsWith("/images")
                            ? item.img
                            : "/images/" + item.img
                        }`
                      : "/images/default_image.png"
                  }
                  alt={item.name}
                  className="w-4/5 h-4/5 object-contain"
                />
              </div>
              <div className="flex-grow flex flex-col text-[#e0e0e0] text-center sm:text-left">
                <div className="font-semibold text-lg mb-1">
                  {item.name}
                </div>
                <div className="text-xs text-gray-400 mb-0.5">
                  {item.optionLabel || item.option || "Standard Option"}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 mt-3 sm:mt-0">
                <div className="flex items-center space-x-2">
                  <button
                    className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-white">{item.quantity}</span>
                  <button
                    className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="text-white font-semibold flex-shrink-0 w-20 text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <button
                  className="text-red-500 hover:text-red-700 ml-4 flex-shrink-0"
                  onClick={() => removeFromCart(item.cartItemId)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  &#x2715; {/* Unicode 'X' mark */}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-[#22252a] rounded-lg p-6 shadow-xl md:w-1/3 w-full sticky top-5">
          <h2 className="text-white text-2xl font-semibold mb-5 border-b border-gray-700 pb-4">
            Order Summary
          </h2>

          <div className="flex justify-between text-[#e0e0e0] mb-3">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-[#e0e0e0] mb-5 border-b border-gray-700 pb-4">
            <span>Shipping:</span>
            <span>Free</span>
          </div>

          <div className="flex justify-between text-white font-bold text-lg mb-6">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            className="w-full bg-blue-600 border-none py-3 rounded-md font-semibold text-base text-white cursor-pointer uppercase tracking-wider mt-5 transition-colors duration-200 hover:bg-blue-700"
            >
            Continue to Checkout
          </button>
        </div>
      </div>

      {/* New Section: Delivery and Trust Info */}
      <div className="mt-20 w-full max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center text-[#e0e0e0]">
          <div>
            <div className="text-4xl mb-2">📧</div>
            <h3 className="font-semibold text-lg"> Email delivery</h3>
            <p className="text-gray-400 text-sm mt-1">
              Your digital Gift card is ready to use within 10 minutes.
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">⭐</div>
            <h3 className="font-semibold text-lg">Trusted Online Store</h3>
            <p className="text-gray-400 text-sm mt-1">
              Our store is recommended by TrustPilot users for digital purchases.
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">✅</div>
            <h3 className="font-semibold text-lg">Secure & Easy</h3>
            <p className="text-gray-400 text-sm mt-1">
              Your payments are secured by an SSL certificate.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Basket;
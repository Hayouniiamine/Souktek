// src/components/Basket.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from './Footer';
import Navbar from './Navbar';
import { useCart } from "./context/CartContext";
import API_BASE_URL from "../config"; // Added: Import API_BASE_URL

const Basket = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotalPrice } = useCart();

  const subtotal = getCartTotalPrice();
  const total = subtotal;

  console.log("Basket component: Current cart state:", cart);
  console.log("Basket component: Calculated subtotal:", subtotal, "Type:", typeof subtotal);
  console.log("Basket component: Calculated total:", total, "Type:", typeof total);


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
                      ? `${API_BASE_URL}${ // Changed to API_BASE_URL
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
                <div className="flex items-center bg-[#1a1d22] rounded-md overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    aria-label="Decrease quantity"
                    className="bg-transparent border-none text-[#e0e0e0] w-7 h-7 text-lg cursor-pointer flex items-center justify-center border-r border-[#333]"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center font-semibold text-base text-[#e0e0e0]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    aria-label="Increase quantity"
                    className="bg-transparent border-none text-[#e0e0e0] w-7 h-7 text-lg cursor-pointer flex items-center justify-center border-l border-[#333]"
                  >
                    +
                  </button>
                </div>

                <div className="font-bold text-lg text-[#e0e0e0] min-w-20 text-right">
                  {(() => {
                    console.log("Basket item details:", item);
                    console.log("  item.price:", item.price, "type:", typeof item.price);
                    console.log("  item.quantity:", item.quantity, "type:", typeof item.quantity);

                    const parsedPrice = parseFloat(item.price);
                    const parsedQuantity = parseInt(item.quantity); // Use parseInt for quantity, parseFloat for price

                    if (isNaN(parsedPrice) || isNaN(parsedQuantity)) {
                        console.warn("WARN: Invalid price or quantity for basket item:", item);
                        return "TND N/A";
                    }
                    const calculatedPrice = parsedPrice * parsedQuantity;
                    return `TND${calculatedPrice.toFixed(2)}`;
                  })()}
                </div>
                <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="bg-red-600 text-white border-none rounded px-2.5 py-1.5 cursor-pointer text-xs ml-2"
                >
                    Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary */}
        <div className="flex flex-col gap-4 flex-1 bg-[#22252a] rounded-lg p-5 shadow-md text-[#e0e0e0] w-full md:w-1/3 md:mt-20 h-fit">
          <div className="font-semibold text-lg mb-2">
            Order Summary
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#333]">
            <span className="text-sm text-gray-400">Subtotal</span>
            <span className="font-semibold text-base">
              {(() => {
                console.log("Subtotal value:", subtotal, "type:", typeof subtotal);
                const parsedSubtotal = parseFloat(subtotal);
                if (isNaN(parsedSubtotal)) {
                  console.warn("WARN: Subtotal is not a valid number:", subtotal);
                  return "TND N/A";
                }
                return `TND${parsedSubtotal.toFixed(2)}`;
              })()}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-lg">
              {(() => {
                console.log("Total value:", total, "type:", typeof total);
                const parsedTotal = parseFloat(total);
                if (isNaN(parsedTotal)) {
                  console.warn("WARN: Total is not a valid number:", total);
                  return "TND N/A";
                }
                return `TND${parsedTotal.toFixed(2)}`;
              })()}
            </span>
          </div>

          <button
            onClick={() => navigate("/checkout")}
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
              Our checkout process is secure and easy to use.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Basket;
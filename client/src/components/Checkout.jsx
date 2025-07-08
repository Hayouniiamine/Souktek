// src/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useCart } from "./context/CartContext";
import API_BASE_URL from "../config";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, getCartTotalPrice } = useCart();

  const paymentMethods = [
    { id: "ooredoo", name: "Carte recharge Ooredoo" },
    { id: "orange",  name: "Carte recharge Orange" },
    { id: "telecom", name: "Carte recharge Telecom" },
    { id: "d17",     name: "D17" },
    { id: "flouci",  name: "Flouci" },
  ];

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [email, setEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [transactionNum, setTransactionNum] = useState("");
  const [showPaymentUI, setShowPaymentUI] = useState(false);

  const subtotal = getCartTotalPrice();
  const serviceFee = 0;
  const total = subtotal + serviceFee;

  useEffect(() => {
    if (cart.length === 0) navigate("/basket");
  }, [cart, navigate]);

  const handlePaymentSelect = (id) => {
    setSelectedPaymentMethod(id);
    setShowPaymentUI(true);
    setEmail("");
    setWhatsappPhone("");
    setTransactionNum("");
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod || !email || !whatsappPhone || !transactionNum) {
      console.log("Please complete all required fields.");
      return;
    }

    try {
      for (const item of cart) {
        const res = await fetch(`${API_BASE_URL}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: Number(item.id), // Ensures it's a number
            product_name: item.name,
            payment_method: selectedPaymentMethod,
            email,
            phone: whatsappPhone,
            transaction_number: transactionNum,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed for ${item.name}`);
        }
      }

      console.log("Order placed successfully!");
      navigate("/success");
    } catch (err) {
      console.error("Order error:", err);
      console.log("Error placing order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1117] flex flex-col items-center">
      <Navbar />

      <div className="flex flex-col lg:flex-row gap-5 w-full max-w-7xl px-5 py-10">
        <div className="flex flex-col gap-4 flex-grow lg:w-2/3 bg-[#22252a] rounded-lg p-5 shadow-md">
          <button
            className="text-blue-500 text-base font-medium mb-2 self-start"
            onClick={() => navigate("/basket")}
          >
            &#x2190; Back to Basket
          </button>

          <h2 className="text-2xl font-semibold mb-5 text-white">
            Select Payment Method
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentMethods.map((pm) => (
              <label
                key={pm.id}
                className={`flex items-center p-3 rounded-md cursor-pointer transition-all ${
                  selectedPaymentMethod === pm.id
                    ? "bg-[#3a3f47] border border-blue-500"
                    : "bg-[#1a1d22] border border-[#333]"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={pm.id}
                  checked={selectedPaymentMethod === pm.id}
                  onChange={() => handlePaymentSelect(pm.id)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-base font-medium">{pm.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:w-2/3 bg-[#22252a] rounded-lg p-5 shadow-md mt-5 lg:mt-0">
          <h2 className="text-2xl font-semibold mb-5 text-white">
            Instructions de Paiement
          </h2>
          <ul className="list-decimal list-inside space-y-2 text-base text-gray-300">
            <li>Pay via D17 @ 20 123 567 or Flouci @ 20 123 567.</li>
            <li>Copy the authorisation number.</li>
            <li>Paste it into the field below.</li>
            <li>
              For recharge cards, join them with <code>+</code>:<br />
              <span className="font-mono text-sm text-gray-400">
                1st card + 2nd card + 3rd card …
              </span>
            </li>
            <li>Enter your email and phone, then click “Place order”.</li>
            <li>Our team will contact you within 10 minutes.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4 lg:w-1/3 bg-[#22252a] rounded-lg p-5 shadow-md">
          <h3 className="font-semibold text-lg mb-2">Order Summary</h3>

          {cart.map((it) => (
            <div
              key={it.cartItemId ?? it.id}
              className="flex justify-between text-sm border-b border-[#333] pb-2 mb-2"
            >
              <span>{it.name} × {it.quantity}</span>
              <span>TND{(it.price * it.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="flex justify-between text-sm text-gray-400">
            <span>Subtotal</span>
            <span className="font-semibold text-base">TND{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-400 border-b border-[#333] pb-2">
            <span>Service Fee</span>
            <span className="font-semibold text-base">TND{serviceFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-lg pt-2">
            <span>Total</span>
            <span>TND{total.toFixed(2)}</span>
          </div>

          {showPaymentUI && (
            <div className="mt-6 border-t border-[#333] pt-4">
              <h4 className="text-lg font-semibold mb-4">Payment Details</h4>

              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-3 p-2 rounded-md bg-[#1a1d22] border border-[#333] text-sm"
                required
              />

              <label className="block text-sm mb-1">WhatsApp / Phone</label>
              <input
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className="w-full mb-3 p-2 rounded-md bg-[#1a1d22] border border-[#333] text-sm"
                required
              />

              <label className="block text-sm mb-1">Transaction Ref</label>
              <input
                value={transactionNum}
                onChange={(e) => setTransactionNum(e.target.value)}
                className="w-full mb-5 p-2 rounded-md bg-[#1a1d22] border border-[#333] text-sm"
                required
              />

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-md font-semibold uppercase tracking-wider"
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

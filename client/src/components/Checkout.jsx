import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from "./context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotalPrice } = useCart();

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
      navigate('/basket');
    }
  }, [cart, navigate]);

  const handlePaymentMethodChange = (methodId) => {
    setSelectedPaymentMethod(methodId);
    setShowPaymentDetails(true);
    setEmail("");
    setWhatsappPhone("");
    setTransactionNumber("");
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      // Replaced alert with a more user-friendly message, consider a custom modal for production
      console.log("Please select a payment method.");
      return;
    }
    if (!email || !whatsappPhone || !transactionNumber) {
      // Replaced alert with a more user-friendly message, consider a custom modal for production
      console.log("Please fill in all required payment details.");
      return;
    }

    try {
      // Place orders for each product in the cart
      for (const item of cart) {
        const response = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: item.productId,   // this is the correct foreign key
            product_name: item.name,
            payment_method: selectedPaymentMethod,
            email: email,
            phone: whatsappPhone,
            transaction_number: transactionNumber,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to place order for " + item.name);
        }
      }

      // Replaced alert with a more user-friendly message, consider a custom modal for production
      console.log("Order placed successfully!");
      navigate("/success"); // Create a success page if needed
    } catch (error) {
      console.error("Order error:", error);
      // Replaced alert with a more user-friendly message, consider a custom modal for production
      console.log("Error placing your order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1117] font-['Segoe_UI',_Tahoma,_Geneva,_Verdana,_sans-serif] flex flex-col items-center">
      <Navbar />

      <div className="flex flex-col lg:flex-row gap-5 w-full max-w-7xl px-5 py-10 items-start">
        {/* Left Column: Select Payment Method */}
        <div className="flex flex-col gap-4 flex-grow lg:w-2/3 w-full bg-[#22252a] rounded-lg p-5 shadow-md text-[#e0e0e0]">
          <div
            className="text-blue-500 text-base font-medium mb-2 cursor-pointer self-start"
            onClick={() => navigate("/basket")}
          >
            &#x2190; Back to Basket
          </div>

          <h2 className="text-2xl font-semibold mb-5 text-white">
            Select Payment Method
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-3 rounded-md cursor-pointer transition-all duration-200 ${
                  selectedPaymentMethod === method.id
                    ? "bg-[#3a3f47] border border-blue-500"
                    : "bg-[#1a1d22] border border-[#333]"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedPaymentMethod === method.id}
                  onChange={() => handlePaymentMethodChange(method.id)}
                  className="mr-2 accent-blue-500"
                />
                <div className="flex-grow text-left">
                  <span className="text-base font-medium">{method.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* New Container: Payment Instructions */}
        <div className="flex flex-col gap-4 flex-grow lg:w-2/3 w-full bg-[#22252a] rounded-lg p-5 shadow-md text-[#e0e0e0] mt-5 lg:mt-0">
          <h2 className="text-2xl font-semibold mb-5 text-white">
            Instructions de Paiement
          </h2>
          <ul className="list-decimal list-inside space-y-2 text-base text-gray-300 font-['Roboto',_sans-serif]">
            <li>Traitez le paiement via D17 au 20 123 567 ou Flouci au 20 123 567</li>
            <li>Ouvrez le journal D17 ou Flouci et copiez-collez le numéro d'autorisation</li>
            <li>Insérez ce numéro d'autorisation dans la boîte spécifiée</li>
            <li>Si vous payez avec des cartes de recharge Ooredoo/Telecom/Orange, écrivez les cartes de cette manière :<br />
              <span className="font-mono text-sm text-gray-400 ml-5">Exemple : première carte + deuxième carte + troisième carte etc...</span>
            </li>
            <li>Indiquez votre adresse e-mail</li>
            <li>Indiquez votre numéro de téléphone</li>
            <li>Cliquez sur "Passer la commande"</li>
            <li>Notre équipe vous contactera dans les 10 minutes</li>
          </ul>
        </div>

        {/* Right Column: Order Summary and Dynamic Inputs */}
        <div className="flex flex-col gap-4 flex-1 bg-[#22252a] rounded-lg p-5 shadow-md text-[#e0e0e0] w-full lg:w-1/3 h-fit">
          <div className="font-semibold text-lg mb-2">
            Order Summary
          </div>

          {cart.map((item) => (
            <div key={item.cartItemId} className="flex justify-between text-sm text-[#e0e0e0] border-b border-[#333] pb-2 mb-2">
              <span>{item.name} x {item.quantity}</span>
              <span>TND{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="flex justify-between items-center pb-1">
            <span className="text-sm text-gray-400">Subtotal</span>
            <span className="font-semibold text-base">
              TND{subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#333]">
            <span className="text-sm text-gray-400">Service Fee</span>
            <span className="font-semibold text-base">
              TND{serviceFee.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-lg">
              TND{total.toFixed(2)}
            </span>
          </div>

          {/* Dynamic Payment Input Fields */}
          {showPaymentDetails && (
            <div className="mt-5 pt-4 border-t border-[#333]">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Payment Details
              </h3>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-300 mb-1 text-sm">Email</label>
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
              <div className="mb-4">
                <label htmlFor="whatsappPhone" className="block text-gray-300 mb-1 text-sm">WhatsApp / Phone Number</label>
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

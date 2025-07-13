import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useCart } from "./context/CartContext";
import API_BASE_URL from "../config";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotalPrice } = useCart();

  // State has been simplified
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [emailError, setEmailError] = useState("");

  const subtotal = getCartTotalPrice();
  const serviceFee = 0;
  const total = subtotal + serviceFee;

  useEffect(() => {
    // Redirect to basket if the cart is empty
    if (cart.length === 0) navigate("/basket");
  }, [cart, navigate]);

  // Simple email validation
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Simplified order handler
  const handlePlaceOrder = async () => {
    // Updated validation: removed transactionNum and selectedPaymentMethod
    if (!fullName || !email || !whatsappPhone) {
      console.log("Veuillez remplir tous les champs requis.");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Veuillez entrer une adresse e-mail valide.");
      return;
    }

    try {
      const productsPayload = cart.map(item => ({
        product_id: Number(item.productId),
        product_name: item.name,
        quantity: item.quantity ?? 1,
      }));

      // Updated payload: removed transaction_number and payment_method
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: productsPayload,
          full_name: fullName,
          email,
          phone: whatsappPhone,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erreur lors de la commande");
      }

      console.log("Commande passée avec succès !");
      navigate("/success");

    } catch (err) {
      console.error("Erreur de commande:", err);
      console.log("Erreur lors de la commande. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1117] flex flex-col items-center">
      <Navbar />

      <div className="flex flex-col lg:flex-row gap-5 w-full max-w-7xl px-5 py-10">
        {/* Container 1: Banner Image */}
        <div className="flex flex-col gap-4 flex-grow lg:w-2/3 bg-[#22252a] rounded-lg p-5 shadow-md">
          <button
            className="text-blue-500 text-base font-medium mb-2 self-start"
            onClick={() => navigate("/basket")}
          >
            &#x2190; Retour au panier
          </button>
          {/* Radio buttons replaced with the banner image */}
          <img 
            src="/uploads/full-mode-paiment-2048x375.webp" 
            alt="Payment Methods Banner"
            className="w-full h-auto rounded-md"
          />
        </div>

        {/* Container 2: Payment Instructions */}
        <div className="flex flex-col gap-4 lg:w-2/3 bg-[#22252a] rounded-lg p-5 shadow-md mt-5 lg:mt-0">
          <h2 className="text-2xl font-semibold mb-5 text-white">
            Instructions de Paiement
          </h2>
          <ul className="list-decimal list-inside space-y-2 text-base text-gray-300">
            <li>Payer via D17 20563760 ou Flouci 20563760.</li>
            <li>Copiez le numéro d’autorisation.</li>
            <li>Collez-le dans le champ ci-dessous.</li>
            <li>
              Pour les cartes recharge, joignez-les avec <code>+</code>:<br />
              <span className="font-mono text-sm text-gray-400">
                1ère carte + 2ème carte + 3ème carte …
              </span>
            </li>
            <li>Entrez votre e-mail et téléphone, puis cliquez sur “Passer la commande”.</li>
            <li>Notre équipe vous contactera dans les 10 minutes.</li>
            {/* Added new instruction item */}
            <li>Contactez-nous sur WhatsApp pour finaliser la commande.</li>
          </ul>
        </div>

        {/* Container 3: Order Summary & Customer Details */}
        <div className="flex flex-col gap-4 lg:w-1/3 bg-[#22252a] rounded-lg p-5 shadow-md">
          <h3 className="font-semibold text-lg mb-2 text-white">Récapitulatif de la commande</h3>

          {cart.map((it) => (
            <div
              key={it.cartItemId ?? it.id}
              className="flex justify-between text-sm border-b border-[#333] pb-2 mb-2 text-white"
            >
              <span>{it.name} × {it.quantity}</span>
              <span>TND{(it.price * it.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="flex justify-between text-sm text-gray-400">
            <span>Sous-total</span>
            <span className="font-semibold text-base">TND{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-400 border-b border-[#333] pb-2">
            <span>Frais de service</span>
            <span className="font-semibold text-base">TND{serviceFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-lg pt-2 text-white">
            <span>Total</span>
            <span>TND{total.toFixed(2)}</span>
          </div>

          {/* Form is now always visible */}
          <div className="mt-6 border-t border-[#333] pt-4">
            <h4 className="text-lg font-semibold mb-4 text-white">Vos informations</h4>

            <label className="block text-sm mb-1 text-white">Nom Complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mb-3 p-2 rounded-md bg-[#1a1d22] border border-[#333] text-sm text-white"
              required
            />

            <label className="block text-sm mb-1 text-white">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              className="w-full mb-3 p-2 rounded-md bg-[#1a1d22] border border-[#333] text-sm text-white"
              required
            />
            {emailError && (
              <p className="text-red-500 text-sm mb-2">{emailError}</p>
            )}

            <label className="block text-sm mb-1 text-white">WhatsApp / Téléphone</label>
            <input
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              className="w-full mb-3 p-2 rounded-md bg-[#1a1d22] border border-[#333] text-sm text-white"
              required
            />

            {/* Transaction number input removed */}

            <button
              onClick={handlePlaceOrder}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-md font-semibold uppercase tracking-wider"
            >
              Passer la commande
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
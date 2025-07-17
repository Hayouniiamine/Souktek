import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";

export default function Bestsellers() {
  const [products, setProducts] = useState([]);
  const [showAllGames, setShowAllGames] = useState(false);
  const [showAllGiftCards, setShowAllGiftCards] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to load products:", err));
  }, []);

  const giftCardProducts = products.filter((p) => p.type === "gift_cards");
  const gameProducts = products.filter((p) => p.type === "games");
  const bestsellerProducts = products.filter((p) => p.type === "bestsellers");

  const displayedGiftCards = showAllGiftCards
    ? giftCardProducts
    : giftCardProducts.slice(0, 10);
  const displayedGames = showAllGames
    ? gameProducts
    : gameProducts.slice(0, 5);

  return (
    <section className="bg-[#0e1117] text-white py-8 px-4">
      <div className="max-w-screen-xl mx-auto">

        {/* ⭐ Best Sellers Section */}
        {bestsellerProducts.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">🔥 Best Sellers</h2>
            <div className="overflow-x-auto pb-4 -mx-2">
              <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-2">
                {bestsellerProducts.map((product, index) => (
                  <Link
                    to={`/product/${encodeURIComponent(product.name)}`}
                    key={index}
                    className="min-w-[150px] sm:min-w-0 bg-[#1a1d23] p-4 rounded-xl hover:shadow-lg hover:scale-105 transition duration-300 block"
                  >
                    <div className="aspect-square flex justify-center items-center overflow-hidden mb-3">
                      <img
                        src={
                          product.img
                            ? `${API_BASE_URL}${
                                product.img.startsWith("/images") ||
                                product.img.startsWith("/uploads")
                                  ? product.img
                                  : "/images/" + product.img
                              }`
                            : "/images/default_image.png"
                        }
                        alt={product.name}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="text-sm font-semibold truncate">
                      {product.name}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {product.price}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 🎁 Gift Cards Section */}
        <h2 className="text-xl font-semibold mb-4">
          Gift Cards and Subscriptions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {displayedGiftCards.map((product, index) => (
            <Link
              to={`/product/${encodeURIComponent(product.name)}`}
              key={index}
              className="bg-[#1a1d23] p-4 rounded-xl hover:shadow-lg hover:scale-105 transition duration-300 block"
            >
              <div className="aspect-square flex justify-center items-center overflow-hidden mb-3">
                <img
                  src={
                    product.img
                      ? `${API_BASE_URL}${
                          product.img.startsWith("/images") ||
                          product.img.startsWith("/uploads")
                            ? product.img
                            : "/images/" + product.img
                        }`
                      : "/images/default_image.png"
                  }
                  alt={product.name}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="text-sm font-semibold truncate">
                {product.name}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {product.price}
              </div>
            </Link>
          ))}
        </div>

        {giftCardProducts.length > 10 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShowAllGiftCards(!showAllGiftCards)}
              className="px-6 py-3 bg-white text-black font-semibold rounded-full shadow-md hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 group"
            >
              <span className="text-base">
                {showAllGiftCards ? "Show Less" : "Show More"}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 ${
                  showAllGiftCards ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* 🎮 Games Section */}
        <h2 className="text-xl font-semibold mt-16 mb-6">
          Games Keys and Accounts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {displayedGames.map((product, index) => (
            <Link
              to={`/product/${encodeURIComponent(product.name)}`}
              key={index}
              className="bg-[#1a1d23] p-4 rounded-xl hover:shadow-lg hover:scale-105 transition duration-300 block"
            >
              <div className="aspect-square flex justify-center items-center overflow-hidden mb-3">
                <img
                  src={
                    product.img
                      ? `${API_BASE_URL}${
                          product.img.startsWith("/images") ||
                          product.img.startsWith("/uploads")
                            ? product.img
                            : "/images/" + product.img
                        }`
                      : "/images/default_image.png"
                  }
                  alt={product.name}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="text-sm font-semibold truncate">
                {product.name}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {product.price}
              </div>
            </Link>
          ))}
        </div>

        {gameProducts.length > 6 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShowAllGames(!showAllGames)}
              className="px-6 py-3 bg-white text-black font-semibold rounded-full shadow-md hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 group"
            >
              <span className="text-base">
                {showAllGames ? "Show Less" : "Show More"}
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 ${
                  showAllGames ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* 💡 Features Section */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl mb-2">📧</div>
            <h3 className="font-semibold text-lg"> Email delivery</h3>
            <p className="text-gray-400 text-sm mt-1">
              Your digital Gift card is ready to use within 10 minutes.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">⭐</div>
            <h3 className="font-semibold text-lg">Trusted Online Store</h3>
            <p className="text-gray-400 text-sm mt-1">
              Our store is recommended by TrustPilot users for digital
              purchases.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold text-lg">Secure & Easy</h3>
            <p className="text-gray-400 text-sm mt-1">
              Our checkout process is secure and easy to use.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

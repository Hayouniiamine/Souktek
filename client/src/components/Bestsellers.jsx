import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";

// New Slideshow Component
const ProductSlideshow = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? products.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === products.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  // Automatically advance the slideshow every 5 seconds
  useEffect(() => {
    const slideInterval = setInterval(goToNext, 5000);
    return () => clearInterval(slideInterval); // Cleanup interval on component unmount
  }, [currentIndex, products.length]);


  if (!products || products.length === 0) {
    return null; // Don't render anything if there are no products
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-12">
      <Link to={`/product/${encodeURIComponent(currentProduct.name)}`} className="block w-full h-full">
        <img
          src={`${API_BASE_URL}${
            currentProduct.img.startsWith("/images") || currentProduct.img.startsWith("/uploads")
              ? currentProduct.img
              : "/images/" + currentProduct.img
          }`}
          alt={currentProduct.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
            <h3 className="text-white text-2xl md:text-4xl font-bold">{currentProduct.name}</h3>
            <p className="text-gray-300 text-lg">{currentProduct.price}</p>
        </div>
      </Link>
      
      {/* Navigation Buttons */}
      <button onClick={goToPrevious} className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors">
        ❮
      </button>
      <button onClick={goToNext} className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors">
        ❯
      </button>

       {/* Slide Indicators */}
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {products.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${currentIndex === index ? 'bg-white scale-125' : 'bg-gray-400'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};


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

  // Filter for each category including the new 'top' type
  const topProducts = products.filter(
    (product) => product.type && product.type.includes("top")
  );
  const giftCardProducts = products.filter(
    (product) => product.type && product.type.includes("gift_cards")
  );
  const gameProducts = products.filter(
    (product) => product.type && product.type.includes("games")
  );

  // Slicing logic for "Show More" functionality
  const displayedGiftCards = showAllGiftCards
    ? giftCardProducts
    : giftCardProducts.slice(0, 10);
  const displayedGames = showAllGames ? gameProducts : gameProducts.slice(0, 5);

  return (
    <section className="bg-[#0e1117] text-white py-8 px-4">
      <div className="max-w-screen-xl mx-auto">
        
        {/* Slideshow Section */}
        <ProductSlideshow products={topProducts} />

        {/* Gift Cards Section */}
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
              <div className="text-gray-400 text-xs mt-1">{product.price}</div>
            </Link>
          ))}
        </div>

        {/* Show More Button for Gift Cards */}
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

        {/* Games Section */}
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
              <div className="text-gray-400 text-xs mt-1">{product.price}</div>
            </Link>
          ))}
        </div>

        {/* Show More Button for Games */}
        {gameProducts.length > 5 && (
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

        {/* Features Section */}
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
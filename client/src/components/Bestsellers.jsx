import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";

// New: A stylish SVG icon to replace the emoji
const HotIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-10 h-10 text-orange-500"
  >
    <path 
      fillRule="evenodd" 
      d="M12.963 2.286a.75.75 0 00-1.071 1.071l9 9a.75.75 0 001.071-1.071l-9-9zM10.884 5.432a.75.75 0 00-1.06-1.06l-6.5 6.5a.75.75 0 001.06 1.06l6.5-6.5z" 
      clipRule="evenodd" 
    />
    <path 
      fillRule="evenodd" 
      d="M9.53 2.22a.75.75 0 010 1.06l-6.5 6.5a.75.75 0 01-1.06-1.06l6.5-6.5a.75.75 0 011.06 0zM12.963 2.286a.75.75 0 00-1.071 1.071l9 9a.75.75 0 001.071-1.071l-9-9z" 
      clipRule="evenodd" 
    />
  </svg>
);


// Card for the 3D Carousel
const ProductCard = ({ product, isactive }) => {
  if (!product) return null;

  return (
    <div className="relative w-full h-full">
      {/* Icon is now in a wrapper, positioned outside the card */}
      <div className="absolute -top-3 -right-3 z-20">
        <HotIcon />
      </div>
      <div 
        className={`w-full h-full absolute transition-all duration-500 ease-in-out ${isactive ? 'opacity-100' : 'opacity-50 scale-90'}`}
      >
        <div className="bg-[#1a1d23] rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col group">
          <div className="relative overflow-hidden h-2/3">
            <img
              src={`${API_BASE_URL}${
                product.img.startsWith("/images") || product.img.startsWith("/uploads")
                  ? product.img
                  : "/images/" + product.img
              }`}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          </div>
          <div className="p-4 flex flex-col flex-grow justify-center text-center">
            <h3 className="text-white text-lg font-bold truncate mb-3">{product.name}</h3>
            <Link 
              to={`/product/${encodeURIComponent(product.name)}`} 
              className="bg-white text-black font-bold py-2 px-5 rounded-full self-center group-hover:bg-orange-500 transition-colors duration-300"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3D Circular Carousel Component
const ProductSlideshow = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };
  
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
  };

  useEffect(() => {
    if (products.length < 2) return;
    const slideInterval = setInterval(goToNext, 4000);
    return () => clearInterval(slideInterval);
  }, [products.length]);

  if (!products || products.length === 0) {
    return null;
  }
  
  // Reduced radius and sizes for a more compact, mobile-friendly look
  const radius = 170; 
  const angleStep = products.length > 0 ? 360 / products.length : 0;

  return (
    // Reduced overall height of the component
    <div className="w-full flex flex-col items-center justify-center mb-12">
        <div className="relative h-[320px] w-full" style={{ perspective: '1000px' }}>
            <div 
              className="absolute w-full h-full"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateY(${-currentIndex * angleStep}deg)`,
                transition: 'transform 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
              }}
            >
              {products.map((product, index) => {
                const angle = index * angleStep;
                return (
                  <div
                    key={product.id}
                    className="absolute w-48 h-72 top-1/2 left-1/2 -mt-36 -ml-24" 
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    }}
                  >
                    <ProductCard product={product} isactive={currentIndex === index} />
                  </div>
                );
              })}
            </div>
        </div>

       <div className="flex gap-8 mt-4 z-20">
            <button onClick={goToPrevious} className="px-6 py-2 bg-white text-black font-semibold rounded-full shadow-md hover:bg-gray-200 transition-all duration-300">
              Prev
            </button>
            <button onClick={goToNext} className="px-6 py-2 bg-white text-black font-semibold rounded-full shadow-md hover:bg-gray-200 transition-all duration-300">
              Next
            </button>
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

  const topProducts = products.filter(
    (product) => product.type && product.type.includes("top")
  );
  const giftCardProducts = products.filter(
    (product) => product.type && product.type.includes("gift_cards")
  );
  const gameProducts = products.filter(
    (product) => product.type && product.type.includes("games")
  );

  const displayedGiftCards = showAllGiftCards
    ? giftCardProducts
    : giftCardProducts.slice(0, 10);
  const displayedGames = showAllGames ? gameProducts : gameProducts.slice(0, 5);

  return (
    <section className="bg-[#0e1117] text-white py-8 px-4">
      <div className="max-w-screen-xl mx-auto">
        
        <ProductSlideshow products={topProducts} />

        <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">
          Gift Cards & Subscriptions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {displayedGiftCards.map((product, index) => (
            <Link
              to={`/product/${encodeURIComponent(product.name)}`}
              key={index}
              className="bg-[#1a1d23] p-4 rounded-xl hover:shadow-lg hover:scale-105 transition duration-300 block"
            >
              <div className="aspect-w-1 aspect-h-1 flex justify-center items-center overflow-hidden mb-3">
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

        <h2 className="text-2xl font-bold mt-16 mb-4 text-center sm:text-left">
          Game Keys & Accounts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {displayedGames.map((product, index) => (
            <Link
              to={`/product/${encodeURIComponent(product.name)}`}
              key={index}
              className="bg-[#1a1d23] p-4 rounded-xl hover:shadow-lg hover:scale-105 transition duration-300 block"
            >
              <div className="aspect-w-1 aspect-h-1 flex justify-center items-center overflow-hidden mb-3">
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
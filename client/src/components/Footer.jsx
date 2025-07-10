import React from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";

export default function Footer() {
  const productIcons = [
    "apple.webp", "crunchyroll.png", "fortnite.webp", "freefire.webp", "linkedin.webp",
    "netflix.webp", "playstation.webp", "rewarble-chatgpt.webp", "rewarble-discord.webp",
    "rewarble-tiktok-ads.webp", "starzaplay.png", "steam.webp", "tinder.webp", "Shahid.png",
    "surfshark.png", "prepexility.jpg", "xbox.png", "tod.png", "Gemini_Advanced.png",
    "disney.webp", "google.webp", "picture.png", "spotify.webp", "roblox.webp", "tinder.webp",
    "osn.png",
  ];

  const handleTermsClick = () => {
    window.location.href = "/terms-conditions";
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-[#0e1117] text-white py-12 px-6 mt-16 border-t border-gray-800">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <h2 className="text-xl font-semibold mb-4">About Souktek</h2>
          <p className="text-gray-400 text-sm mb-4">
            Souktek is your trusted destination for purchasing digital gift
            cards from top brands around the world. Safe, instant, and secure
            payment guaranteed.
          </p>
          <ul className="flex gap-4 mt-4">
            <li>
              <a
                href="https://www.tiktok.com/@souktek.tn?_t=ZM-8xccULv4V5s&_r=1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/icons/tiktok.webp"
                  alt="TikTok"
                  className="w-10 h-10"
                />
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/souktek.tn?igsh=eXViNjMybXM4bDh3"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`${API_BASE_URL}/uploads/1752108171595.png`}
                  alt="Instagram"
                  className="w-10 h-10"
                />
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/profile.php?id=61577084570822&mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/icons/facebook.png"
                  alt="Facebook"
                  className="w-10 h-10"
                />
              </a>
            </li>
          </ul>
          <p className="text-gray-400 text-sm mt-3">
            Contact us on WhatsApp:{" "}
            <a
              href="https://wa.me/21620563760"
              className="text-blue-400 underline"
            >
              +216 20 563 760
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Legal</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <button
                className="hover:text-blue-500 bg-transparent border-none p-0 cursor-pointer"
                onClick={handleTermsClick}
              >
                Terms & Conditions
              </button>
            </li>
            <li>
              <button
                type="button"
                className="text-gray-400 hover:text-blue-500 underline cursor-pointer bg-transparent border-none p-0"
                onClick={() => alert("Feature coming soon!")}
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                className="text-gray-400 hover:text-blue-500 underline cursor-pointer bg-transparent border-none p-0"
                onClick={() => alert("Feature coming soon!")}
              >
                Refund Policy
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Support</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <button
                type="button"
                className="text-gray-400 hover:text-blue-500 underline cursor-pointer bg-transparent border-none p-0"
                onClick={() => alert("Feature coming soon!")}
              >
                Help Center
              </button>
            </li>
            <li>
              <button
                type="button"
                className="text-gray-400 hover:text-blue-500 underline cursor-pointer bg-transparent border-none p-0"
                onClick={() => alert("Feature coming soon!")}
              >
                How to Buy
              </button>
            </li>
            <li>
              <button
                type="button"
                className="text-gray-400 hover:text-blue-500 underline cursor-pointer bg-transparent border-none p-0"
                onClick={() => alert("Feature coming soon!")}
              >
                Account Support
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Our Products</h2>
          <div className="grid grid-cols-4 gap-4">
            {productIcons.map((icon, i) => (
              <img
                key={i}
                src={`/images/icons/${icon}`}
                alt={icon.replace(/\.(png|webp|jpg)$/i, "")}
                className="w-10 h-10 object-contain"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Souktek. All rights reserved.
      </div>
      <div className="mt-12 text-center text-sm text-gray-600">
        &copy;Developed by Hayouni_Amin.
      </div>
    </footer>
  );
}

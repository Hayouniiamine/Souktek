import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

export default function Footer() {
  const productIcons = [
    "apple.webp",
    "crunchyroll.png",
    "fortnite.webp",
    "freefire.webp",
    "linkedin.webp",
    "netflix.webp",
    "playstation.webp",
    "rewarble-chatgpt.webp",
    "rewarble-discord.webp",
    "rewarble-tiktok-ads.webp",
    "starzaplay.png",
    "steam.webp",
    "tinder.webp",
    "Shahid.png",
    "surfshark.png",
    "prepexility.jpg",
    "xbox.png",
    "tod.png",
    "Gemini_Advanced.png",
    "disney.webp",
    "google.webp",
    "picture.png",
    "spotify.webp",
    "roblox.webp",
    "tinder.webp",
    "watch_it.webp",
    "osn.png",
  ];

  return (
    <footer className="bg-[#0e1117] text-white py-12 px-6 mt-16 border-t border-gray-800">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* About Us */}
        <div>
          <h2 className="text-xl font-semibold mb-4">About DigiShop</h2>
          <p className="text-gray-400 text-sm mb-4">
            DigiShop is your trusted destination for purchasing digital gift
            cards from top brands around the world. Safe, instant, and secure
            payment guaranteed.
          </p>
          <ul className="flex gap-4 mt-4">
            <li>
              <a
                href="https://www.instagram.com/souktek.tn?igsh=eXViNjMybXM4bDh3"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/icons/instagram.png"
                  alt="Instagram"
                  className="w-10 h-10"
                />
              </a>
            </li>
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

        {/* Legal */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Legal</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              {/* Link to the TermsConditions page */}
              <Link to="/terms-conditions" className="hover:text-blue-500">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Refund Policy</a>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Support</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a href="#">Help Center</a>
            </li>
            <li>
              <a href="#">How to Buy</a>
            </li>
            <li>
              <a href="#">Account Support</a>
            </li>
          </ul>
        </div>

        {/* Product Icons */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Our Products</h2>
          <div className="grid grid-cols-4 gap-4">
            {productIcons.map((icon, i) => (
              <img
                key={i}
                src={`/images/icons/${icon}`}
                alt={icon.replace(".png", "").replace(".webp", "")}
                className="w-10 h-10 object-contain"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} DigiShop. All rights reserved.
      </div>
    </footer>
  );
}

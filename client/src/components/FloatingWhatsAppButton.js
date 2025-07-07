// client/src/components/FloatingWhatsAppButton.js

import React from 'react';
import './FloatingWhatsAppButton.css'; // Import the CSS for this component

const FloatingWhatsAppButton = () => {
  // Replace this with your actual WhatsApp API link from Step 1
const whatsappLink = "https://wa.me/21620563760?text=salut%20jai%20une%20question";
  return (
    <a
      href={whatsappLink}
      className="whatsapp-float"
      target="_blank"        // Opens in a new tab
      rel="noopener noreferrer" // Security best practice for target="_blank"
      aria-label="Chat on WhatsApp" // Accessibility
    >
      {/* The image source assumes you have 'whatsapp-icon.png' 
        in your 'client/public/images/' folder.
        Make sure the path is correct relative to your public folder.
      */}
      <img src="/images/whatsapp-icon.png" alt="WhatsApp Chat" />
    </a>
  );
};

export default FloatingWhatsAppButton;
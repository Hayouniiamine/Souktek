import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Try to load cart from localStorage, otherwise start with an empty array
  const [cart, setCart] = useState(() => {
    try {
      const localCart = localStorage.getItem('digishop_cart');
      return localCart ? JSON.parse(localCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('digishop_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (productOption, productDetails) => {
    setCart((prevCart) => {
      // Create a unique ID for the cart item, combining product ID and option ID
      // This ensures different options of the same product are separate items
      const cartItemId = `${productDetails.id}-${productOption.id}`;

      const existingItemIndex = prevCart.findIndex(
        (item) => item.cartItemId === cartItemId
      );

      if (existingItemIndex > -1) {
        // If item exists, update its quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1,
        };
        return newCart;
      } else {
        // If item doesn't exist, add it
        return [
          ...prevCart,
          {
            cartItemId: cartItemId, // Unique ID for this specific cart item
            id: productOption.id, // ID of the product option
            productId: productDetails.id,
            name: productDetails.name,
            optionLabel: productOption.label,
            price: Number(productOption.price), // Ensure price is a number
            description: productOption.description,
            img: productDetails.img, // Use the product's main image
            quantity: 1,
          },
        ];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, change) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: Math.max(1, item.quantity + change) } // Ensure quantity is at least 1
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotalItems,
        getCartTotalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
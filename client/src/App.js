import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Bestsellers from "./components/Bestsellers";
import Footer from "./components/Footer";
import ProductPage from './components/ProductPage';

import Login from './components/Login';
import SecretKeyVerification from './components/SecretKeyVerification';
import UserDashboard from './components/UserDashboard';

import AdminDashboard from './components/AdminDashboard';
import CreateProduct from './components/CreateProduct';
import ReadProducts from './components/ReadProducts';
import UpdateProduct from './components/UpdateProduct';
import EditProduct from './components/EditProduct';
import DeleteProduct from './components/DeleteProduct';

import Basket from './components/Basket';
import Checkout from './components/Checkout';
import Success from "./components/Success"; // Import the Success component
import TermsConditions from "./components/TermsConditions"; // Import the TermsConditions component

// Import the FloatingWhatsAppButton component
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';


function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Bestsellers />
      <Footer />
    </>
  );
}

function App() {
  return (
    <div className="bg-[#0e1117] text-white min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/product/:name" element={<ProductPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/secret-key-verification" element={<SecretKeyVerification />} />
        <Route path="/terms-conditions" element={<TermsConditions />} /> {/* New route for Terms and Conditions */}

        {/* User Routes */}
        <Route path="/user-dashboard" element={<UserDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-product" element={<CreateProduct />} />
        <Route path="/admin/read-products" element={<ReadProducts />} />
        <Route path="/admin/update-product" element={<UpdateProduct />} />
        <Route path="/admin/edit-product/:id" element={<EditProduct />} />
        <Route path="/admin/delete-product" element={<DeleteProduct />} />

        {/* New routes for Basket and Checkout */}
        <Route path="/basket" element={<Basket />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} /> {/* New route for the Success component */}

        {/* 404 Route (catch-all for invalid paths) */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>

      {/* Render the FloatingWhatsAppButton here so it appears on all pages */}
      <FloatingWhatsAppButton />
    </div>
  );
}

export default App;

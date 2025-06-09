import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SellItem from "./pages/SellItem";
import EditListing from "./pages/EditListing";
import BidPage from "./pages/BidPage";
import MyListings from "./pages/MyListings";
import ImageUploadPage from "./pages/upl";

import Header from "./components/Header";
import Footer from "./components/Footer";


function App() {
  const isApiRoute = window.location.pathname.startsWith("/api");



  return (
    <div>
      <Router>
        <Header />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sell" element={<SellItem />} />
          <Route path="/edit/:id" element={<EditListing />} />
          <Route path="/bid/:id" element={<BidPage />} />
          <Route path="/mylistings" element={<MyListings />} />
          <Route path="/uploadImgTest" element={<ImageUploadPage />} />

          {/* Only add the catch-all route if not an API request */}
          {!isApiRoute && (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}


export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Header from "./components/Header";
import Footer from "./components/Footer";
import TestYR from "./components/YRtest";


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
          {/* Only add the catch-all route if not an API request */}
          {!isApiRoute && (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
        <TestYR />
        <Footer />
      </Router>
    </div>
  );
}


export default App;

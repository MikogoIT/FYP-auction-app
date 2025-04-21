import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
  
    const handleLogout = () => {
      localStorage.removeItem("token");
      navigate("/login"); 
    };
  
    return (
      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
        <h2 style={{ textAlign: "center" }}>
          ✅ Welcome to the Dashboard
        </h2>
  
        <button
          onClick={handleLogout}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "10px",
            backgroundColor: "#d9534f",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Log Out
        </button>
      </div>
    );
  };

export default Dashboard;
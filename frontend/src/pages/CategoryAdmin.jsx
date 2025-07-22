// src/pages/Template.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import BreadcrumbsNav from "../components/BreadcrumbsNav";


// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";


export default function CategoryAdmin() {

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">
        <BreadcrumbsNav />
        {/* page title */}
        <div className="profileTitle">Category Management</div>
        
    
      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}
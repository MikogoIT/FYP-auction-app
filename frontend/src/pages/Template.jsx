// src/pages/Template.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";


export default function Dashboard() {

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">

        {/* page title */}
        <div className="profileTitle">Recent Listings</div>

    
      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}
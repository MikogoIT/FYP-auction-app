// src/pages/MyListingsBids.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import BreadcrumbsNav from "../components/BreadcrumbsNav";


// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";


export default function MyListingsBids() {

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">
        <BreadcrumbsNav />

        {/* 2 nav Buttons */}
        <div
          className="toggleButtons"
          style={{ display: "flex", gap: 8, marginBottom: 16 }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/myListings")}
            sx={{
              borderRadius: "999px",
              borderColor: "grey.400",
              color: "grey.500",
              '&:hover': { borderColor: 'grey.600' },
            }}
          >
            My Listings
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/MyListingsBids")}
            sx={{
              borderRadius: "999px",
              borderColor: "primary.main",
              color: "primary.main",
              '&:hover': { borderColor: 'primary.dark' },
            }}
          >
            Bids On My Listings
          </Button>
        </div>


        {/* page title */}
        <div className="profileTitle">Bids on my listings</div>
        
    
      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}
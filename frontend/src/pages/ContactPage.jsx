// src/pages/ContactPage.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";


export default function ContactPage() {

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">

        {/* page title */}
        <div className="profileTitle">Contact us!!</div>

        {/* Feedback form */}
        <FeedbackForm
          heading="Send Us Your Feedback"
          endpoint="/api/feedback" // or your desired endpoint
        />

      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}
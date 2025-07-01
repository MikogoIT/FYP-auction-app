// src/components/Footer.jsx

import React from "react";

const Footer = () => {
  // compute days left
  const today = new Date();
  // Note: months are zero-indexed, so 7 = August
  const targetDate = new Date(2025, 7, 16);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = targetDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diff / msPerDay);

  return (
    <div className="footerCon">
      AUCTIONEER - an online auction platform with telegram integration. Final Year
      Project (FYP)
      <br />
      CSIT321 - PROJECT
      <br />
      Project ID: CSIT-25-S2-12
      <br />
      Group ID: FYP-25-S2-23
      <br />
      Timothy (8750634), Saud (8576919), Shi Long (8552186), Qing Yuan (8561655),
      Raydon (8466385), Yang Run (7771642)
      <br />
      Assessor: Mr Premarajan , Supervisor: Mr Aaron Yeo
      <br /><br />
      {daysLeft} days to submission deadline
    </div>
  );
};

export default Footer;

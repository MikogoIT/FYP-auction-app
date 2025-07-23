// src/pages/Template.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import { Link } from "react-router";



// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";


export default function CategoryAdmin() {

  // need help to implement functions to:
  // create category
  // edit category
  // suspend category

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">
        {/* page title */}
        <div className="profileTitle">Admin Dashboard</div>
        <Stack direction="row" spacing={2}>
            <Button 
            variant="contained"
            component={Link}
            to="/admin"
            sx={{
              borderColor: "grey.400",
              color: "grey.500",
              "&:hover": {borderColor: "grey.600"}
            }}
            >
              User Management</Button>
            <Button
            variant="outlined"
            component={Link}
            to="/admin/categoryadmin"
            color="primary"
            >
              Category Management</Button>
        </Stack>
        
    
      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}
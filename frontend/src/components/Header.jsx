import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import Typography from '@mui/material/Typography';

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Hide logout on both the login page and the suspended page
  const hideLogout = pathname === "/login" || pathname === "/ursuspended";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId")
    navigate("/login"); 
  };

  return (
    <div className="headerBar">
      <h3 className="headerTitle">AUCTIONEER</h3>
      {!hideLogout && (
        <Tooltip title="Logout">
          <IconButton
            className="logoutIconButton"
            onClick={handleLogout}
            color="secondary"
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default Header;
// src/components/Header.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Chip, Avatar } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { IMG_BASE_URL } from "../global-vars.jsx";

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);

  const hideLogout = ["/login", "/register"].includes(pathname);

  useEffect(() => {
    // check login + fetch profile photo
    fetch("/api/displayPhoto", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          setIsLoggedIn(false);
          return;
        }
        const { profile_image_url } = await res.json();
        setPhotoUrl(profile_image_url || null);
        setIsLoggedIn(true);
      })
      .catch(() => setIsLoggedIn(false));

    // fetch admin flag
    fetch("/api/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setIsAdmin(!!data.user?.is_admin))
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  const goToAdminPage = () => navigate("/admin");
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setIsLoggedIn(false);
    setPhotoUrl(null);
    navigate("/");
  };
  const handleLogoClick = () => {
    navigate(isLoggedIn ? "/dashboard" : "/");
  };

  return (
    <div className="headerBar">
      <div className="headerContent">
        {/* Logo */}
        <img
          src={`${IMG_BASE_URL}full-logo.png`}
          className="headerLogo"
          alt="Logo"
          onClick={handleLogoClick}
          style={{ width: 150, cursor: "pointer" }}
        />

        {/* Chips group */}
        <div
          className="loginChips"
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Profile or Log in */}
          <Chip
            label={isLoggedIn ? "Profile" : "Log in"}
            onClick={() =>
              navigate(isLoggedIn ? "/profile" : "/login")
            }
            clickable
            avatar={
              <Avatar src={isLoggedIn && photoUrl ? photoUrl : undefined}>
                <PersonIcon />
              </Avatar>
            }
          />

          {/* Admin chip */}
          {isAdmin && (
            <Chip
              label="Admin"
              icon={
                <AdminPanelSettingsIcon
                  sx={{ color: "warning.main" }}
                />
              }
              onClick={goToAdminPage}
              clickable
              sx={{ marginLeft: "15px" }}
            />
          )}

          {/* Register */}
          {!isLoggedIn && (
            <Chip
              label="Register"
              onClick={() => navigate("/register")}
              clickable
              sx={{ marginLeft: isAdmin ? "15px" : "8px" }}
            />
          )}

          {/* Logout */}
          {isLoggedIn && !hideLogout && (
            <Chip
              label="Log out"
              onClick={handleLogout}
              clickable
              sx={{ marginLeft: isAdmin ? "15px" : "8px" }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

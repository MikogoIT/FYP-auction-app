import { useNavigate, useLocation } from "react-router-dom";
import { IconButton, Tooltip, Button, Chip, Avatar } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { IMG_BASE_URL } from "../global-vars.jsx";
import { useEffect, useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);

  // Hide logout on "/", "/login" and "/register"
  const hideLogout = ["/", "/login", "/register"].includes(pathname);

  // Check login + fetch profile photo
  useEffect(() => {
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
      .catch(() => {
        setIsLoggedIn(false);
      });

    // fetch admin flag
    fetch("/api/users/profile", { credentials: "include" })
      .then(res => res.json())
      .then(data => setIsAdmin(!!data.user?.is_admin))
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  const goToAdminPage = () => navigate("/admin");
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    navigate("/");
  };

  return (
    <div
      className="headerBar"
      style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 }}
    >
      <div className="headerContent" style={{ position: "relative", padding: "0 16px" }}>
        {/* Avatar Chip in top-right */}
        <Chip
          label={isLoggedIn ? "Profile" : "Log in"}
          onClick={() => navigate(isLoggedIn ? "/profile" : "/login")}
          clickable
          avatar={
            <Avatar src={isLoggedIn && photoUrl ? photoUrl : undefined}>
              <PersonIcon />
            </Avatar>
          }
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
          }}
        />

        <img
          src={`${IMG_BASE_URL}full-logo.png`}
          style={{ width: "150px", cursor: "pointer" }}
          alt="Logo"
          onClick={() => navigate("/")}
        />

        {!hideLogout && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
            {isAdmin && (
              <Button variant="contained" color="primary" onClick={goToAdminPage}>
                Admin
              </Button>
            )}
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} color="secondary">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;

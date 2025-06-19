import { useNavigate, useLocation } from "react-router-dom";
import { Chip, Avatar, Button } from "@mui/material";
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
  const hideLogout = [ "/login", "/register"].includes(pathname);

  useEffect(() => {
    // check login + fetch profile photo
    fetch("/api/displayPhoto", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return setIsLoggedIn(false);
        const { profile_image_url } = await res.json();
        setPhotoUrl(profile_image_url || null);
        setIsLoggedIn(true);
      })
      .catch(() => setIsLoggedIn(false));

    // fetch admin flag
    fetch("/api/profile", { credentials: "include" })
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
    <div className="headerBar">
      <div className="headerContent">

        {/* Logo */}
        <img
          src={`${IMG_BASE_URL}full-logo.png`}
          style={{ width: 150, cursor: "pointer" }}
          alt="Logo"
          onClick={() => navigate("/")}
        />

        {/* Admin button stays where it was */}
        {!hideLogout && isAdmin && (
          <Button
            variant="contained"
            color="primary"
            onClick={goToAdminPage}
            sx={{ marginLeft: "auto" }}
          >
            Admin
          </Button>
        )}

        {/* Profile/Login + Logout chips */}
        <div>
          <Chip
            label={isLoggedIn ? "Profile" : "Log in"}
            onClick={() => navigate(isLoggedIn ? "/profile" : "/login")}
            clickable
            avatar={
              <Avatar src={isLoggedIn && photoUrl ? photoUrl : undefined}>
                <PersonIcon />
              </Avatar>
            }
          />
          {isLoggedIn && !hideLogout && (
            <Chip
              label="Logout"
              onClick={handleLogout}
              clickable
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

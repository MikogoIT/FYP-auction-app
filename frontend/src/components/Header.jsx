import { useNavigate, useLocation } from "react-router-dom";
import { IconButton, Tooltip, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { IMG_BASE_URL } from "../global-vars.jsx";
import { useEffect, useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Hide logout on "/", "/login" and "/register"
  const hideLogout = ["/", "/login", "/register"].includes(pathname);

  useEffect(() => {
    fetch("/isLoggedIn", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          setIsLoggedIn(false);
          throw new Error("Not logged in");
        }
        setIsLoggedIn(true);
        return res.json();
      })
      .then((data) => {
        setIsAdmin(!!data.user?.is_admin);
      })
      .catch(() => {
        setIsAdmin(false);
      });
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
      <div className="headerContent" style={{ position: "relative" }}>
        {/* Status box: red when logged out, blue when logged in */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "16px",
            height: "16px",
            borderRadius: "4px",
            backgroundColor: isLoggedIn ? "blue" : "red",
          }}
        />

        <img
          src={`${IMG_BASE_URL}full-logo.png`}
          style={{ width: "150px", cursor: "pointer" }}
          alt="Logo"
          onClick={() => navigate("/")}
        />

        {!hideLogout && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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

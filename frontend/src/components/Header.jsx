import { useNavigate, useLocation } from "react-router-dom";
import { IconButton, Tooltip, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { IMG_BASE_URL } from "../global-vars.jsx";
import { useEffect, useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  // Hide logout on both the login page
  const hideLogout = pathname === "/login";

  useEffect(() => {
    fetch("/api/users/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.is_admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .catch((err) => {
        setIsAdmin(false);
        console.error("Error checking admin status:", err);
      });
  }, [pathname]);

  const goToAdminPage = () => {
    navigate("/admin");
  };

  return (
    <div className="headerBar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px" }}>
      <img src={`${IMG_BASE_URL}full-logo.png`} style={{ width: "150px" }} />

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
  );
};
export default Header;
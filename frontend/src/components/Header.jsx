import { useNavigate, useLocation } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { IMG_BASE_URL } from "../global-vars.jsx";

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
      <img src={`${IMG_BASE_URL}full-logo.png`} style={{width: '150px'}} />
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
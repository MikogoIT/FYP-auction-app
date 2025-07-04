import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Box,
  Chip,
  Avatar,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import ListIcon from "@mui/icons-material/List";
import { IMG_BASE_URL } from "../global-vars.jsx";

const drawerWidth = 240;
const hideDrawerRoutes = ["/", "/login", "/register"];

const Header = ({ window, children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const showDrawer = !hideDrawerRoutes.includes(pathname);

  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleDrawer = () => setMobileOpen((o) => !o);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  useEffect(() => {
    fetch("/api/displayPhoto", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return setIsLoggedIn(false);
        const { profile_image_url } = await res.json();
        setPhotoUrl(profile_image_url || null);
        setIsLoggedIn(true);
      })
      .catch(() => setIsLoggedIn(false));

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

  // drawer menu items
  const drawer = (
    <Box sx={{ width: drawerWidth }} role="presentation">
      <Toolbar />
      <Divider />
      <List>
        <ListItem button selected={pathname === "/dashboard"} onClick={() => navigate('/dashboard')}>
          <ListItemIcon><InboxIcon /></ListItemIcon>
          <ListItemText primary="Recent Listings" />
        </ListItem>
        <ListItem button selected={pathname === "/ListingPage"} onClick={() => navigate('/ListingPage')}>
          <ListItemIcon><ListIcon /></ListItemIcon>
          <ListItemText primary="All Listings" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Header bar at top */}
      <Box
        className="headerBar"
        sx={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Box
          className="headerContent"
          sx={{ display: 'flex', alignItems: 'center', px: 2 }}
        >
          {showDrawer && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <img
            src={`${IMG_BASE_URL}full-logo.png`}
            className="headerLogo"
            alt="Logo"
            onClick={handleLogoClick}
            style={{ width: 150, cursor: 'pointer' }}
          />
          <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            {isAdmin && (
              <Chip
                label="Admin"
                icon={<AdminPanelSettingsIcon />}
                onClick={goToAdminPage}
                clickable
                sx={{ mr: 2, bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
              />
            )}
            <Chip
              label={isLoggedIn ? 'Profile' : 'Log in'}
              onClick={() => navigate(isLoggedIn ? '/profile' : '/login')}
              clickable
              avatar={<Avatar src={isLoggedIn && photoUrl ? photoUrl : undefined}><PersonIcon /></Avatar>}
              sx={{ mr: isLoggedIn && !hideDrawerRoutes.includes(pathname) ? 2 : 0 }}
            />
            {!isLoggedIn && (
              <Chip label="Register" onClick={() => navigate('/register')} clickable sx={{ mr: 2 }} />
            )}
            {isLoggedIn && !["/login", "/register"].includes(pathname) && (
              <Chip label="Log out" onClick={handleLogout} clickable />
            )}
          </Box>
        </Box>
      </Box>

      {/* Drawer nav */}
      {showDrawer && (
        <Drawer
          container={window ? () => window().document.body : undefined}
          variant={smUp ? 'permanent' : 'temporary'}
          open={smUp || mobileOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              mt: '64px',
              zIndex: 2,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* main content placeholder should come after header and drawer */}
      <Box component="main" sx={{ flexGrow: 1, mt: '64px', p: 3, width: `calc(100% - ${showDrawer && smUp ? drawerWidth : 0}px)` }}>
        {children}
      </Box>
    </Box>
  );
};

Header.propTypes = {
  window: PropTypes.func,
  children: PropTypes.node,
};

export default Header;

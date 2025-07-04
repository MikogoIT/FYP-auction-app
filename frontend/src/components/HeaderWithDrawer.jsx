import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
  useMediaQuery,
  Chip,
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate, useLocation } from 'react-router-dom';
import { IMG_BASE_URL } from '../global-vars.jsx';

const drawerWidth = 240;
const hideLogoutRoutes = ['/login', '/register'];

/**
 * HeaderWithDrawer: AppBar with responsive Drawer, plus logo & login chips.
 */
function HeaderWithDrawer({ window }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('md')); // md = 900px

  // Auth & profile state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    // fetch profile image and login status
    fetch('/api/displayPhoto', { credentials: 'include' })
      .then(async res => {
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
    fetch('/api/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setIsAdmin(!!data.user?.is_admin))
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  const handleDrawerToggle = () => setMobileOpen(prev => !prev);

  // Logo click nav
  const handleLogoClick = () => navigate(isLoggedIn ? '/dashboard' : '/');
  const goToAdminPage = () => navigate('/admin');
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setIsLoggedIn(false);
    setPhotoUrl(null);
    navigate('/');
  };

  // Drawer content
  const drawer = (
    <Box
      sx={{ width: drawerWidth }}
      role="presentation"
      onClick={handleDrawerToggle}
      onKeyDown={handleDrawerToggle}
    >
      <Toolbar />
      <Divider />
      <List>
        <ListItem button onClick={() => navigate('/dashboard')}>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button onClick={() => navigate('/ListingPage')}>
          <ListItemText primary="All Listings" />
        </ListItem>
        {/* Add more items as needed */}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar with logo & chips */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}> 
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }} // hide on md-up
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box component="img"
            src={`${IMG_BASE_URL}full-logo.png"`}
            alt="Logo"
            onClick={handleLogoClick}
            sx={{ height: 40, cursor: 'pointer' }}
          />

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Chips area */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}> 
            {isAdmin && (
              <Chip
                label="Admin"
                icon={<AdminPanelSettingsIcon />}
                onClick={goToAdminPage}
                clickable
                sx={{ mr: 1, bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
              />
            )}

            <Chip
              label={isLoggedIn ? 'Profile' : 'Log in'}
              onClick={() => navigate(isLoggedIn ? '/profile' : '/login')}
              clickable
              avatar={<Avatar src={photoUrl || undefined}><PersonIcon /></Avatar>}
              sx={{ mr: 1 }}
            />

            {!isLoggedIn && (
              <Chip label="Register" onClick={() => navigate('/register')} clickable sx={{ mr: 1 }} />
            )}

            {isLoggedIn && !hideLogoutRoutes.includes(pathname) && (
              <Chip label="Log out" onClick={handleLogout} clickable />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer nav */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {!smUp ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Offset main content below AppBar */}
      <Toolbar />
    </Box>
  );
}


export default HeaderWithDrawer;

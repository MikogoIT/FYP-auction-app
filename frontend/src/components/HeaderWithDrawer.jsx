import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
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
 * Highlights active drawer item based on current pathname.
 */
function HeaderWithDrawer({ window }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md')); // md = 900px

  // Auth & profile state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    fetch('/api/displayPhoto', { credentials: 'include' })
      .then(async res => {
        if (!res.ok) return setIsLoggedIn(false);
        const { profile_image_url } = await res.json();
        setPhotoUrl(profile_image_url || null);
        setIsLoggedIn(true);
      })
      .catch(() => setIsLoggedIn(false));

    fetch('/api/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setIsAdmin(!!data.user?.is_admin))
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  const handleDrawerToggle = () => setMobileOpen(prev => !prev);

  const handleLogoClick = () => navigate(isLoggedIn ? '/dashboard' : '/');
  const goToAdminPage = () => navigate('/admin');
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setIsLoggedIn(false);
    setPhotoUrl(null);
    navigate('/');
  };

  // Drawer content with active item highlighting
  const drawer = (
    <Box
      sx={{ width: drawerWidth }}
      role="presentation"
      onClick={() => { if (!mdUp) setMobileOpen(false); }}
      onKeyDown={() => { if (!mdUp) setMobileOpen(false); }}
    >
      <Toolbar />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={pathname === '/dashboard'}
            onClick={() => navigate('/dashboard')}
          >
            <ListItemIcon></ListItemIcon>
            <ListItemText primary="Recent Listings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={pathname === '/ListingPage'}
            onClick={() => navigate('/ListingPage')}
          >
            <ListItemIcon></ListItemIcon>
            <ListItemText primary="All Listings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={pathname === '/mylistings'}
            onClick={() => navigate('/mylistings')}
          >
            <ListItemIcon></ListItemIcon>
            <ListItemText primary="My Listings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'white',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            component="img"
            src={`${IMG_BASE_URL}full-logo.png`}
            alt="Logo"
            onClick={handleLogoClick}
            sx={{ height: 40, cursor: 'pointer' }}
          />
          <Box sx={{ flexGrow: 1 }} />
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
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {mdUp ? (
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderRight: 'none',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderRight: 'none',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Toolbar />
    </Box>
  );
}

export default HeaderWithDrawer;

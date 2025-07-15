// src/components/HeaderWithDrawer.jsx
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
import { useTheme, styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import { useNavigate, useLocation } from 'react-router-dom';
import { IMG_BASE_URL } from '../global-vars.jsx';
import ListingSearchBar from './ListingSearchBar';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

const drawerWidth = 240;
const hideLogoutRoutes = ['/login', '/register'];

export default function HeaderWithDrawer({ window }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  // auth / profile state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/displayPhoto', { credentials: 'include' })
      .then(async res => {
        if (!res.ok) { setIsLoggedIn(false); return; }
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

  const handleDrawerToggle = () => setMobileOpen(o => !o);
  const handleLogoClick   = () => navigate(isLoggedIn ? '/dashboard' : '/');
  const goToAdminPage     = () => navigate('/admin');
  const handleLogout      = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setIsAdmin(false);
    setIsLoggedIn(false);
    setPhotoUrl(null);
    navigate('/');
  };

  const handleSearch = query =>
    navigate(`/listings?q=${encodeURIComponent(query.trim())}`);

  const OutlineListItemButton = styled(ListItemButton)(() => ({
    borderRadius: '24px',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      border: `1px solid gray`,
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'transparent',
    },
  }));

  const drawer = (
    <Box
      sx={{ width: drawerWidth }}
      role="presentation"
      onClick={() => { if (!mdUp) setMobileOpen(false); }}
      onKeyDown={() => { if (!mdUp) setMobileOpen(false); }}
    >
      {mdUp && <Toolbar />}

      {/* Group 1 */}
      <List sx={{ '& .MuiListItemText-primary': { fontSize: '16px' } }}>
        <ListItem disablePadding>
          <OutlineListItemButton
            selected={pathname === '/dashboard'}
            onClick={() => navigate('/dashboard')}
          >
            <ListItemIcon />
            <ListItemText primary="Home" />
          </OutlineListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <OutlineListItemButton
            selected={pathname === '/ListingPage'}
            onClick={() => navigate('/ListingPage')}
          >
            <ListItemIcon />
            <ListItemText primary="All Categories" />
          </OutlineListItemButton>
        </ListItem>
      </List>
      <Divider />

      {/* Group 2 */}
      <List sx={{ '& .MuiListItemText-primary': { fontSize: '16px' } }}>
        <ListItem disablePadding>
          <OutlineListItemButton
            selected={pathname === '/sell'}
            onClick={() => navigate('/sell')}
          >
            <ListItemIcon><AddOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Create Listings" />
          </OutlineListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <OutlineListItemButton
            selected={pathname === '/Watchlist'}
            onClick={() => navigate('/Watchlist')}
          >
            <ListItemIcon />
            <ListItemText primary="Liked Listings" />
          </OutlineListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <OutlineListItemButton
            selected={pathname === '/mylistings'}
            onClick={() => navigate('/mylistings')}
          >
            <ListItemIcon />
            <ListItemText primary="My Listings" />
          </OutlineListItemButton>
        </ListItem>
      </List>
      <Divider />

      {/* Group 3 */}
      <List sx={{ '& .MuiListItemText-primary': { fontSize: '16px' } }}>
        <ListItem disablePadding>
          <OutlineListItemButton
            selected={pathname === '/MyBids'}
            onClick={() => navigate('/MyBids')}
          >
            <ListItemIcon />
            <ListItemText primary="My Bids" />
          </OutlineListItemButton>
        </ListItem>
      </List>
      <Divider />

      {/* Group 4 */}
      <List sx={{ '& .MuiListItemText-primary': { fontSize: '16px' } }}>
        <ListItem disablePadding>
          <OutlineListItemButton
            selected={pathname === '/Contact'}
            onClick={() => navigate('/Contact')}
          >
            <ListItemIcon><ContactSupportIcon /></ListItemIcon>
            <ListItemText primary="Talk to us!" />
          </OutlineListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Main header */}
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
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: '#212121' }}
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
              avatar={<Avatar src={photoUrl}><PersonIcon /></Avatar>}
              sx={{ mr: 1 }}
            />
            {!isLoggedIn && (
              <Chip
                label="Register"
                onClick={() => navigate('/register')}
                clickable
                sx={{ mr: 1 }}
              />
            )}
            {isLoggedIn && !hideLogoutRoutes.includes(pathname) && (
              <Chip label="Log out" onClick={handleLogout} clickable />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Search bar */}
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          top: theme.mixins.toolbar.minHeight,
          left: { md: `${drawerWidth}px` },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'white',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ minHeight: theme.mixins.toolbar.minHeight }}>
          <Box sx={{ width: '100%' }}>
            <ListingSearchBar onSearch={handleSearch} />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
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
            PaperProps={{
              sx: {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderRight: 'none',
                // push down below both AppBar + search bar on mobile
                mt: "110px",
              }
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* push content below both bars */}
      <Toolbar />
      <Toolbar />
    </Box>
  );
}

import { useState } from 'react';
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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

/**
 * HeaderWithDrawer: AppBar with responsive Drawer.
 * Hides hamburger icon on desktop and shows permanent drawer.
 */
function HeaderWithDrawer({ window }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm')); // ADDED: detect desktop size

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };


  const drawer = (
    <Box
      sx={{ width: drawerWidth }}
      role="presentation"
      onClick={handleDrawerToggle} // ADDED: close drawer on item click
      onKeyDown={handleDrawerToggle} // ADDED: close on key event
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
        {/* Additional menu items... */}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }} // MODIFIED: hide on desktop (sm and up)
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>App Title</Box>
          {/* Replace with logo / chips */}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="sidebar"
      >
        {/* MOBILE: temporary drawer */}
        {!smUp && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }} // ADDED: better performance on mobile
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
        {/* DESKTOP: permanent drawer */}
        {smUp && (
          <Drawer
            variant="permanent"
            open // ADDED: always open on desktop
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Spacer to push content below AppBar */}
      <Toolbar />
    </Box>
  );
}

export default HeaderWithDrawer;

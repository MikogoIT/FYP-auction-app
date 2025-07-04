import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CssBaseline from '@mui/material/CssBaseline';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import ListIcon from '@mui/icons-material/List';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const drawerWidth = 240;
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});
const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  })
);

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm')); // >=600px
  const isMobile = useMediaQuery('(max-width:400px)');

  // State for mini-variant open
  const [open] = useState(isSmUp);
  // State for mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Recent listings fetch
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = +localStorage.getItem('userId');
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/listings/recent');
        if (!res.ok) throw new Error('Failed to fetch listings');
        const { listings } = await res.json();
        const enriched = await Promise.all(
          listings.map(async (item) => {
            try {
              const imgRes = await fetch(
                `/api/listingimg?listingId=${encodeURIComponent(item.id)}`
              );
              if (!imgRes.ok) throw new Error();
              const { imageUrl } = await imgRes.json();
              return { ...item, image_url: imageUrl };
            } catch {
              return { ...item, image_url: null };
            }
          })
        );
        setRecentListings(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleBid = (id) => navigate(`/bid/${id}`);
  const handleEdit = (id) => navigate(`/edit/${id}`);

  // Drawer contents
  const drawerContent = (
    <>
      <Toolbar />
      <Divider />
      <List>
        <ListItem button selected>
          <ListItemIcon><InboxIcon /></ListItemIcon>
          <ListItemText primary="Recent Listings" />
        </ListItem>
        <ListItem button onClick={() => navigate('/ListingPage')}>
          <ListItemIcon><ListIcon /></ListItemIcon>
          <ListItemText primary="All Listings" />
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* AppBar with hamburger on mobile */}
      {isMobile && (
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Box component="span" sx={{ flexGrow: 1 }}>Dashboard</Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Temporary Drawer on mobile */}
      {isMobile && (
        <MuiDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
        >
          {drawerContent}
        </MuiDrawer>
      )}

      {/* Mini variant Drawer on larger screens */}
      {!isMobile && (
        <Drawer variant="permanent" open={open}>
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: isMobile ? 8 : 0, // push down when AppBar shown
        }}
      >
        <Toolbar sx={{ display: { xs: 'none', sm: 'block' } }} />
        <h2>Recent Listings</h2>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading listings…</p>
        ) : recentListings.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No recent listings available.</p>
        ) : (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={20}
            breakpoints={{ 320: { slidesPerView: 1 }, 600: { slidesPerView: 2 }, 900: { slidesPerView: 3 } }}
            className="dashboard-swiper"
          >
            {recentListings.map((item) => {
              const isOwner = item.seller_id === currentUserId;
              return (
                <SwiperSlide key={item.id}>
                  <Box className="cardStyle">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="imageStyle" />
                    ) : (
                      <Avatar
                        variant="square"
                        sx={{ width: '100%', height: 200, bgcolor: '#eee' }}
                      >
                        <ImageIcon sx={{ fontSize: 40, color: '#aaa' }} />
                      </Avatar>
                    )}
                    <Box className="detailsStyle">
                      <h3 style={{ margin: 0, marginBottom: 8 }}>{item.title}</h3>
                      <p style={{ margin: '4px 0', color: '#555' }}>{item.description}</p>
                      <Box sx={{ mt: 2 }}>
                        {isOwner ? (
                          <md-filled-button
                            onClick={() => handleEdit(item.id)}
                            style={{ width: '100%' }}
                          >
                            Edit
                          </md-filled-button>
                        ) : (
                          <md-filled-button
                            onClick={() => handleBid(item.id)}
                            style={{ width: '100%' }}
                          >
                            Bid
                          </md-filled-button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </Box>
    </Box>
  );
}

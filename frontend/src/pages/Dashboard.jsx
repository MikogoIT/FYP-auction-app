import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Drawer from '@mui/material/Drawer';
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

function Dashboard(props) {
  const { window } = props;
  const theme = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Fetch listings
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

  const drawer = (
    <div>
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
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: 2,
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Mobile drawer */}
      <Drawer
        container={container}
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            zIndex: 1,
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            zIndex: 1,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Typography variant="h4" gutterBottom>
          Recent Listings
        </Typography>
        {loading ? (
          <Typography align="center">Loading listings…</Typography>
        ) : recentListings.length === 0 ? (
          <Typography align="center">No recent listings available.</Typography>
        ) : (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={20}
            breakpoints={{
              320: { slidesPerView: 1 },
              600: { slidesPerView: 2 },
              900: { slidesPerView: 3 },
            }}
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
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ color: '#555', mb: 2 }}>
                        {item.description}
                      </Typography>
                      <Box>
                        {isOwner ? (
                          <md-filled-button onClick={() => handleEdit(item.id)} style={{ width: '100%' }}>
                            Edit
                          </md-filled-button>
                        ) : (
                          <md-filled-button onClick={() => handleBid(item.id)} style={{ width: '100%' }}>
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

Dashboard.propTypes = {
  window: PropTypes.func,
};

export default Dashboard;

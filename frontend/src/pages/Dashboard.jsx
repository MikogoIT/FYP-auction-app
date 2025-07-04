import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import ListIcon from "@mui/icons-material/List";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const drawerWidth = 240;

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = +localStorage.getItem("userId");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/listings/recent");
        if (!res.ok) throw new Error("Failed to fetch listings");
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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button selected>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Recent Listings" />
            </ListItem>
            <ListItem button onClick={() => navigate('/ListingPage')}>
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary="All Listings" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar />

        {/* page title */}
        <div className="profileTitle">Recent Listings</div>

        {/* content */}
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading listings…</p>
        ) : recentListings.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No recent listings available.</p>
        ) : (
          <>
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
                    <div className="cardStyle">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="imageStyle"
                        />
                      ) : (
                        <Avatar
                          variant="square"
                          sx={{ width: '100%', height: 200, bgcolor: '#eee' }}
                        >
                          <ImageIcon sx={{ fontSize: 40, color: '#aaa' }} />
                        </Avatar>
                      )}
                      <div className="detailsStyle">
                        <h3 style={{ margin: 0, marginBottom: 8 }}>
                          {item.title}
                        </h3>
                        <p style={{ margin: '4px 0', color: '#555' }}>
                          {item.description}
                        </p>
                        <div style={{ marginTop: 16 }}>
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
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <Box sx={{ textAlign: 'center', marginTop: 3 }}>
              <md-filled-tonal-button onClick={() => navigate('/ListingPage')}>
                View all listings
              </md-filled-tonal-button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

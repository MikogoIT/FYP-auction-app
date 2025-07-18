import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ImageIcon from "@mui/icons-material/Image";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useTheme } from "@mui/material/styles";
import { Box, Pagination } from "@mui/material";

// Web components
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination as SwiperPagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const yellow = theme.palette.warning.light;
  const contrastText = theme.palette.getContrastText(yellow);

  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedMap, setLikedMap] = useState({});
  const [page, setPage] = useState(1);
  
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    // fetch watchlist to populate liked icons
    (async () => {
      try {
        const res = await fetch("/api/watchlist/");
        const data = await res.json();
        if (res.ok) {
          const map = {};
          data.forEach(item => {
            map[item.auction_id] = true;
          });
          setLikedMap(map);
        }
      } catch (err) {
        console.error("Could not load watchlist: ", err);
      }
    })();
  }, []);

  useEffect(() => {
    // fetch recent listings + their images
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

  const currentUserId = Number(localStorage.getItem("userId"));
  const handleToggleLike = async (id) => {
    const isLiked = !!likedMap[id];
    const url = isLiked ? "/api/watchlist/remove" : "/api/watchlist/add";
    const method = isLiked ? "DELETE" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auction_id: id }),
      });
      if (!res.ok) throw new Error();
      setLikedMap(m => ({ ...m, [id]: !isLiked }));
    } catch (err) {
      console.error("Error toggling watchlist: ", err);
    }
  };

  const handleBidClick = (id) => navigate(`/bid/${id}`);
  const handleEdit = (id) => navigate(`/edit/${id}`);

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <div className="profileTitle">Recent Listings</div>

        {loading ? (
          <p className="centerText">Loading listings…</p>
        ) : recentListings.length === 0 ? (
          <p className="centerText">No recent listings available.</p>
        ) : (
          <>
            <Swiper
              modules={[Navigation, SwiperPagination]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView="auto"
              className="dashboard-swiper"
            >
              {recentListings.map(item => {
                const isOwner = item.seller_id === currentUserId;
                return (
                  <SwiperSlide key={item.id}>
                    <div className="listingCard">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="listingImage"
                        />
                      ) : (
                        <Avatar 
                          variant="square" 
                          sx={{
                            width: "100%",
                            height: 200,
                            bgcolor: "#eee",
                          }}> 

                          <ImageIcon />
                        </Avatar>
                      )}

                      <div className="listingDetails">
                        <div className="listingTitle">{item.title}</div>
                        <p className="listingDesc">{item.description}</p>
                        <p className="listingMinBid">
                          <strong>Min Bid:</strong> ${item.min_bid}
                        </p>
                        <p className="listingEndDate">
                          <strong>Ends:</strong>{' '}
                          {new Date(item.end_date).toLocaleString('en-SG')}
                        </p>
                        <p>
                          <strong>Current Bid:</strong>{' '}
                          {item.current_bid != null
                            ? `$${item.current_bid}`
                            : 'No bids yet'}
                        </p>
                      </div>

                      <div className="listingAction">
                        <IconButton onClick={() => handleToggleLike(item.id)}>
                          {likedMap[item.id] ? (
                            <FavoriteIcon color="error" />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </IconButton>

                        {isOwner ? (
                          <md-filled-button
                            onClick={() => handleEdit(item.id)}
                            style={{
                              flexGrow: 1,
                              "--md-sys-color-primary": yellow,
                              "--md-sys-color-on-primary": contrastText,
                            }}
                          >
                            Edit
                          </md-filled-button>
                        ) : (
                          <md-filled-button
                            onClick={() => handleBidClick(item.id)}
                            style={{ flexGrow: 1 }}
                          >
                            Bid
                          </md-filled-button>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <Box mt={4} display="flex" justifyContent="center">
              <md-filled-tonal-button onClick={() => navigate('/ListingPage')}>
                View all categories
              </md-filled-tonal-button>
            </Box>
          </>
        )}
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}

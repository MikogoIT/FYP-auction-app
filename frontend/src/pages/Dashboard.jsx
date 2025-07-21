import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ImageIcon from "@mui/icons-material/Image";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useTheme } from "@mui/material/styles";
import { Box, Pagination, Typography, } from "@mui/material";

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
  const [auctionType, setAuctionType] = useState(null);
  const [currentDescPrice, setCurrentDescPrice] = useState(null);
  
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
        setAuctionType(item.auction_type);
        if (item.auction_type === "descending" && typeof item.current_price === "number") {
          setCurrentDescPrice(item.current_price);
        }
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
          <p className="centerText">No recent listings available!</p>
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
                  <SwiperSlide key={item.id} className="listingCard">
                    <div >
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
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1, fontSize: 16 }}
                        >
                          Ends: {new Date(item.end_date).toLocaleString("en-SG")}
                        </Typography>
                        
                        <Typography
                          variant="subtitle2"
                          component="span"
                          sx={{
                            fontSize: 16,
                            display: "inline-block",
                            px: 1.5,
                            py: 0.5,
                            border: "1px solid",
                            borderColor: "grey.800",
                            borderRadius: "999px",
                            color: "grey.800",
                            mr: 1,
                          }}
                        >
                          Starting bid:&nbsp;
                          <strong>{auctionType === "descending" ? Number(item.start_price).toFixed(2) : Number(item.min_bid).toFixed(2)}</strong>
                        </Typography>

                        <Typography
                          variant="subtitle2"
                          component="span"
                          sx={{
                            fontSize: 16,
                            display: "inline-block",
                            px: 1.5,
                            py: 0.5,
                            border: "1px solid",
                            borderColor: "success.main",
                            borderRadius: "999px",
                            color: "success.main",
                          }}
                        >
                          Current bid:&nbsp;
                          <strong>
                            {auctionType === "descending" ? (
                              // descending auction: use currentDescPrice if it’s a number
                              typeof currentDescPrice === "number"
                                ? `$${currentDescPrice.toFixed(2)}`
                                : "No bids yet"
                            ) : (
                              // ascending auction: check for a real current bid, otherwise “No bids yet”
                              item.current_bid != null
                                ? `$${Number(item.current_bid).toFixed(2)}`
                                : "No bids yet"
                            )}
                          </strong>
                        </Typography>



                      </div>
                    </div>
                    <div className="listingAction">
                        <IconButton onClick={() => handleToggleLike(item.id)}>
                          {likedMap[item.id] ? (
                            <FavoriteIcon color="error" />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </IconButton>
{/*  */}
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

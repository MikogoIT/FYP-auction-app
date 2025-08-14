import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Rating,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";
import ListingCard from "../components/ListingCard";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination as SwiperPagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ITEMS_PER_PAGE = 12;

// Helper for star rating (using MUI's Rating for consistency)
function StarRating({ rating, size = "medium", readOnly = true }) {
  return (
    <Rating
      value={rating}
      max={5}
      readOnly={readOnly}
      size={size}
      precision={1}
      sx={{ color: "#f5a623" }}
    />
  );
}

export default function ProfileFeedbackPage() {
  const { userId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [ratingInfo, setRatingInfo] = useState(null);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [authorInfo, setAuthorInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [showListings, setShowListings] = useState(false);
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [likedMap, setLikedMap] = useState({});

  // Load watchlist for liked status
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/watchlist/", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load watchlist");

        const map = {};
        data.forEach((item) => {
          map[item.auction_id] = true;
        });
        setLikedMap(map);
      } catch (err) {
        console.error("Could not load watchlist:", err);
      }
    })();
  }, []);

  useEffect(() => {
    async function fetchFeedback(userId) {
      setLoading(true);
      try {
        // Fetch User Profile
        const userRes = await fetch(`/api/users/${userId}`);
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.message);
        setUser(userData);
       // console.log("Fetched user:", userData);

        // Fetch User Profile Ratings
        const ratingRes = await fetch(`/api/feedback/ratings/${userId}`);
        const ratingData = await ratingRes.json();
        if (!ratingRes.ok) throw new Error(ratingData.message);
        setRatingInfo(ratingData);
        //console.log("Fetched user:", ratingData);

        // Fetch Reviews
        const fbRes = await fetch(`/api/feedback/user/${userId}`);
        const fbData = await fbRes.json();
        if (!fbRes.ok) throw new Error(fbData.message);
        setReviews(fbData);
        //console.log("Fetched reviews:", fbData);

        // Fetch Author Review Info
        const authorIds = [...new Set(fbData.map((r) => r.author_id))];
        const authorInfoEntries = await Promise.all(
          authorIds.map(async (id) => {
            const res = await fetch(`/api/users/${id}`);
            const data = await res.json();
            return [id, data];
          }),
        );
        setAuthorInfo(Object.fromEntries(authorInfoEntries));
        //console.log("Unique author IDs:", authorIds);
      } catch (err) {
        console.error("Failed to load Page:", err);
        setUser(null);
        setRatingInfo(null);
        setReviews([]);
        setAuthorInfo({});
      } finally {
        setLoading(false);
      }
    }
    if (userId) {
      fetchFeedback(userId);
    }
  }, [userId]);

  // Fetch user listings
  const fetchUserListings = async () => {
    setListingsLoading(true);
    try {
      // Get all listings and filter by user
      const res = await fetch("/api/listings");
      if (!res.ok) throw new Error("Failed to fetch listings");
      const { listings: allListings } = await res.json();
      
      // Filter listings by the current profile user
      const userListings = allListings.filter(listing => 
        listing.seller_id === parseInt(userId)
      );

      // Enrich with images
      const enriched = await Promise.all(
        userListings.map(async item => {
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

      setListings(enriched);
    } catch (err) {
      console.error("Failed to fetch user listings:", err);
      setListings([]);
    } finally {
      setListingsLoading(false);
    }
  };

  // Handle showing listings
  const handleShowListings = () => {
    setShowListings(true);
    if (listings.length === 0) {
      fetchUserListings();
    }
  };

  const currentUserId = Number(localStorage.getItem("userId"));

  const handleToggleLike = async (listingId) => {
    const isLiked = !!likedMap[listingId];
    const url = isLiked ? "/api/watchlist/remove" : "/api/watchlist/add";
    const method = isLiked ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ auction_id: listingId }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `${method} ${url} failed`);
      }
      setLikedMap((m) => ({ ...m, [listingId]: !isLiked }));
    } catch (err) {
      console.error("Error toggling watchlist:", err);
    }
  };

  const handleBidClick = (id) => {
    window.location.href = `/bid/${id}`;
  };

  const handleEditClick = (id) => {
    window.location.href = `/edit/${id}`;
  };

  // Filter reviews
  const filteredReviews =
    filter === "All"
      ? reviews
      : reviews.filter((r) => r.author_role === filter.slice(0, -1));

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sort === "Newest")
      return new Date(b.created_at) - new Date(a.created_at);
    if (sort === "Oldest")
      return new Date(a.created_at) - new Date(b.created_at);
    if (sort === "Highest Rating") return b.user_ratings - a.user_ratings;
    if (sort === "Lowest Rating") return a.user_ratings - b.user_ratings;
    return 0;
  });

  // Calculate average rating
  const ratingScore = ratingInfo?.avg_rating ?? "N/A";
  const numReviews = ratingInfo?.total_reviews ?? 0;

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">
        {/* Custom breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{
            width: '100%',
            // make all links and the final Typography 16px
            '& a, & .MuiTypography-root': {
                fontSize: '16px',
          }
        }}>
          <MuiLink component={RouterLink} to="/dashboard" underline="hover" color="inherit">
            Home
          </MuiLink>
          <Typography color="text.primary">Public Profile</Typography>
        </Breadcrumbs>
        {/* Profile Name and Ratings Header */}
          <div className="profileTitle">{user?.username}'s Profile</div>
           <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            src={user?.profile_image_url || undefined}
            sx={{
              width: 80,
              height: 80,
              mr: 3,
              border: "2px solid #eee",
            }}
            alt="User Avatar"
          />
          <Box>
            {numReviews > 0 ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <StarRating
                    rating={Math.round(ratingInfo.avg_rating)}
                    size="large"
                  />
                  <Typography sx={{ ml: 1, color: "#222", fontWeight: 600 }}>
                    {Number(ratingScore).toFixed(1)}
                  </Typography>
                </Box>
                <Typography color="text.secondary" fontSize={16}>
                  {numReviews} Review{numReviews !== 1 ? "s" : ""}
                </Typography>
              </>
            ) : (
              <Typography color="text.secondary" fontSize={16}>
                No ratings yet
              </Typography>
            )}
            <Typography fontSize={16}>{user?.email || ""}</Typography>
          </Box>
        </Box>

        {/* Filters and Sorting */}
        <Box
        sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
        }}
        >
        <Box 
          sx={{
              display: "flex",
              flexWrap: 'wrap',
              gap: "8px"
          }}>
            {/* All Reviews */}
            {filter === "All" && !showListings ? (
            <md-filled-button
                onClick={() => {setFilter("All"); setShowListings(false);}}
               
            >
                All Reviews
            </md-filled-button>
            ) : (
            <md-filled-tonal-button
                onClick={() => {setFilter("All"); setShowListings(false);}}
             
            >
                All Reviews
            </md-filled-tonal-button>
            )}
            
            {/* From Buyers */}
            {filter === "Buyers" && !showListings ? (
            <md-filled-button
                onClick={() => {setFilter("Buyers"); setShowListings(false);}}
                
            >
                From Buyers
            </md-filled-button>
            ) : (
            <md-filled-tonal-button
                onClick={() => {setFilter("Buyers"); setShowListings(false);}}
                
            >
                From Buyers
            </md-filled-tonal-button>
            )}

            {/* From Sellers */}
            {filter === "Sellers" && !showListings ? (
            <md-filled-button onClick={() => {setFilter("Sellers"); setShowListings(false);}}>
                From Sellers
            </md-filled-button>
            ) : (
            <md-filled-tonal-button onClick={() => {setFilter("Sellers"); setShowListings(false);}}>
                From Sellers
            </md-filled-tonal-button>
            )}

            {/* View Listings */}
            {showListings ? (
            <md-filled-button onClick={handleShowListings}>
                View Listings
            </md-filled-button>
            ) : (
            <md-filled-tonal-button onClick={handleShowListings}>
                View Listings
            </md-filled-tonal-button>
            )}

        </Box>

        {!showListings && (
          <Box>
              <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 16,
                  marginLeft: 5,
              }}
              >
              <option>Newest</option>
              <option>Oldest</option>
              <option>Highest Rating</option>
              <option>Lowest Rating</option>
              </select>
          </Box>
        )}
        </Box>

        {/* Content - either Reviews or Listings */}
        {loading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : showListings ? (
          // Show Listings using Swiper (same style as Dashboard)
          <div>
            <div className="profileTitle">Listings by {user?.username}</div>
            {listingsLoading ? (
              <p className="centerText">Loading listings…</p>
            ) : listings.length === 0 ? (
              <p className="centerText">No listings available for this user!</p>
            ) : (
              <Swiper
                modules={[Navigation, SwiperPagination]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={20}
                slidesPerView="auto"
                className="dashboard-swiper"
              >
                {listings.map(item => (
                  <SwiperSlide key={item.id} style={{ width: 300}}>
                    <ListingCard
                      item={item}
                      currentUserId={currentUserId}
                      isLiked={!!likedMap[item.id]}
                      onToggleLike={handleToggleLike}
                      onBidClick={handleBidClick}
                      onEditClick={handleEditClick}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        ) : (
          // Show Reviews
          <Grid container spacing={3} sx={{ maxWidth: 1000 }}>
            {sortedReviews.length === 0 ? (
              <Grid item xs={12}>
                <Box color="#888" p={4} textAlign="center">
                  No reviews to display.
                </Box>
              </Grid>
            ) : (
              sortedReviews.map((review) => {
                const author = authorInfo[review.author_id];
                return (
                  <Grid item xs={12} sm={6} md={4} key={review.id}>
                    <Card variant="outlined" sx={{ bgcolor: "#fafafa" }}>
                      <CardHeader
                        avatar={
                          <Avatar
                            src={author?.profile_image_url}
                            alt={author?.username || "User"}
                          />
                        }
                        title={
                          <Typography variant="subtitle1" fontWeight={600}>
                            {author?.username || "User"}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              ({review.author_role})
                            </Typography>
                          </Typography>
                        }
                        subheader={
                          <Box display="flex" alignItems="center">
                            <StarRating
                              rating={review.user_ratings}
                              size="small"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              {new Date(review.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <CardContent>
                        <Typography variant="body2">
                          {review.user_comments}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        )}
      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}

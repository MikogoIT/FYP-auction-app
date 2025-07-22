import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import { IMG_BASE_URL } from "../global-vars.jsx";
import { useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import markdown from '../mds/landing.md?raw';
import Squiggle from '../components/Squiggle';

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Rating,
  Typography,
} from '@mui/material';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ImageIcon from '@mui/icons-material/Image';

export default function Landing() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const handleGetStarted = () => navigate('/register');

  useEffect(() => {
    // fetch feedback
    fetch('/api/feedback/recent')
      .then(res => res.json())
      .then(data => setFeedback(data.feedback || []))
      .catch(err => console.error('Failed to load feedback:', err));

    // fetch recent listings + images
    (async () => {
      try {
        const res = await fetch('/api/listings/recent');
        if (!res.ok) throw new Error('Failed to fetch listings');
        const { listings } = await res.json();

        const enriched = await Promise.all(
          listings.map(async item => {
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
        setLoadingListings(false);
      }
    })();
  }, []);

  return (
    <div className="landingContent">
      <div className="theBlocks">
        <div className="block" id="landingBlock1">
          <div className="title">
            <p className="title1">Auctioneer</p>
          </div>
          <div className="subtext">
            <p className="subtext1">Your Auctions, One Telegram Away</p>
            <md-filled-button
              style={{ marginTop: '24px' }}
              onClick={handleGetStarted}
            >
              Get Started
            </md-filled-button>
          </div>
        </div>

        <div className="block" id="landingBlock2">
          <img
            className="landing_tele"
            src={`${IMG_BASE_URL}wallpaper.png`}
            alt="Telegram wireframe"
          />
        </div>
      </div>

      <div className="carouselWrapper">
        <h1 className="feedbackHeading">Recent Listings</h1>
        {loadingListings ? (
          <Typography align="center">Loading listings…</Typography>
        ) : recentListings.length === 0 ? (
          <Typography align="center">No recent listings available.</Typography>
        ) : (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView="auto"
            className="dashboard-swiper"
          >
            {recentListings.map(item => {
              const isOwner = item.seller_id === +localStorage.getItem('userId');
              return (
                <SwiperSlide key={item.id} id="listingCardSmall"className="listingCard">
                  <div>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="imageStyle"
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
                      <div className='listingTitle'>
                        {item.title}
                      </div>
                      <p id="listingDescBig" className='listingDesc'>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="noLikeButtonStyle">
                    {isOwner ? (
                      <md-filled-button
                        onClick={() => navigate(`/edit/${item.id}`)}
                        style={{ width: "100%" }}
                      >
                        Edit
                      </md-filled-button>
                    ) : (
                      <md-filled-tonal-button
                        onClick={() => navigate(`/login`)}
                        style={{ width: "100%" }}
                      >
                        Login to bid
                      </md-filled-tonal-button>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>

      <div className="squiggleDiv1">
        <Squiggle />
      </div>

      <div className="landingMD" style={{ lineHeight: 1.6 }}>
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
      <div className="squiggleDiv1">
        <Squiggle />
      </div>

      {/* Recent Feedback Section */}
      <Box className="gridCanvas">
        <h1 className="feedbackHeading">What Our Users Are Saying</h1>
        <div className="viewAll">
          <Link to="/feedbacklist">View all</Link>
        </div>
        <Box className="gridContainer">
          {feedback.map(fb => (
            <Grid item xs={12} sm={6} md={3} key={fb.id}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: '12px',
                  boxSizing: 'border-box',
                  width: 300,
                  height: 200,
                  p: 2,
                  mx: 'auto',
                  '& .MuiCardHeader-root, & .MuiCardContent-root': {
                    p: '4px',
                  },
                }}
              >
                <CardHeader
                  avatar={<Avatar src={fb.profile_image_url} />}
                  title={fb.username}
                  subheader={new Date(fb.created_at).toLocaleDateString()}
                />
                <CardContent>
                  <Rating value={fb.website_ratings} readOnly />
                  <p className="feedbackComment">
                    {fb.website_comments}
                  </p>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {feedback.length === 0 && (
            <Grid item xs={12}>
              <p className="noFeedback">No feedback available yet.</p>
            </Grid>
          )}
        </Box>
      </Box>
    </div>
  );
}

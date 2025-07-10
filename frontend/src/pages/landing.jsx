import '@material/web/button/filled-button.js';
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
} from '@mui/material';

export default function Landing() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);

  const handleGetStarted = () => {
    navigate('/register');
  };

  useEffect(() => {
    fetch('/api/feedback/recent')
      .then(res => res.json())
      .then(data => setFeedback(data.feedback || []))
      .catch(err => console.error('Failed to load feedback:', err));
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

      <div className="landingMD">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
      <div className="squiggleDiv1">
        <Squiggle />
      </div>

      {/* Recent Feedback Section */}
      <Box>
        <h1 className="feedbackHeading">What Our Users Are Saying</h1>
        <Link to="/feedbacklist" className="viewAll">
          View all
        </Link>
        <Grid container spacing={3} justifyContent="center">
          {feedback.map(fb => (
            <Grid item xs={12} sm={6} md={3} key={fb.id}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: '12px',
                  width: 320,
                  height: 200,
                  p: 1,
                  mx: 'auto'
                }}
              >
                <CardHeader
                  avatar={<Avatar src={fb.profile_image_url} />}
                  title={fb.username}
                  subheader={new Date(fb.created_at).toLocaleDateString()}
                />
                <CardContent>
                  <Rating value={fb.website_ratings} readOnly />
                  <p className="feedbackComment" style={{
                      marginTop: 8,
                      maxHeight: 80,   
                      overflowY: "auto",
                      boxSizing: "border-box", // ensures padding is included within maxHeight
                    }}
                  >
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
        </Grid>
      </Box>
    </div>
  );
}

import '@material/web/button/filled-button.js';
import { IMG_BASE_URL } from "../global-vars.jsx";
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import markdown from '../mds/landing.md?raw';

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
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

      {/* Recent Feedback Section */}
      <Box mt={6} px={2}>
        <Typography variant="h5" gutterBottom>
          What Our Users Are Saying
        </Typography>
        <Grid container spacing={3}>
          {feedback.map(fb => (
            <Grid item xs={12} sm={6} md={3} key={fb.id}>
              <Card elevation={2}>
                <CardHeader
                  avatar={<Avatar src={fb.profile_image_url} />}
                  title={fb.username}
                  subheader={new Date(fb.created_at).toLocaleDateString()}
                />
                <CardContent>
                  <Rating value={fb.website_ratings} readOnly />
                  <Typography variant="body2" mt={1}>
                    {fb.website_comments}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {feedback.length === 0 && (
            <Grid item xs={12}>
              <Typography color="textSecondary">
                No feedback available yet.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </div>
  );
}

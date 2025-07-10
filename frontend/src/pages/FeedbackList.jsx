// src/pages/FeedbackList.jsx
import { useEffect, useState } from 'react';
import {
  Avatar,
  Rating,
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
} from '@mui/material';

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('latest');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const reviewsPerPage = 12;

  // Responsive grid columns
  const [gridColumns, setGridColumns] = useState(window.innerWidth < 700 ? 1 : 3);

  useEffect(() => {
    const handleResize = () => setGridColumns(window.innerWidth < 700 ? 1 : 3);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch('/api/feedback/list');
        const data = await res.json();
        if (res.ok) setFeedbacks(data);
        else setError(data.message || 'Failed to load feedbacks.');
      } catch (err) {
        setError('Server error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    if (sortOption === 'latest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortOption === 'highest') {
      return b.website_ratings - a.website_ratings;
    } else if (sortOption === 'lowest') {
      return a.website_ratings - b.website_ratings;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedFeedbacks.length / reviewsPerPage);
  const startIndex = (page - 1) * reviewsPerPage;
  const visibleFeedbacks = sortedFeedbacks.slice(startIndex, startIndex + reviewsPerPage);

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={5}>
        <p>{error}</p>
      </Box>
    );
  }

  return (
    <Box className="landingContent">
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" width="100%">
        <h1 className="feedbackHeading">Reviews From Our Users</h1>
        <Select
          value={sortOption}
          onChange={(e) => {
            setSortOption(e.target.value);
            setPage(1);
          }}
          sx={{
            // overall font size
            fontSize: '16px',
            // round the outline
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: '24px',
            },
            // round the inner select container & adjust padding
            '& .MuiSelect-select': {
              borderRadius: '24px',
              padding: '8px 16px',
              fontSize: '16px',
            },
          }}
        >
          <MenuItem value="latest">Latest</MenuItem>
          <MenuItem value="highest">Highest Rating</MenuItem>
          <MenuItem value="lowest">Lowest Rating</MenuItem>
        </Select>
      </Box>
      <Grid container spacing={2} justifyContent="center">
        {visibleFeedbacks.map((fb) => (
          <Grid item xs={12} sm={6} md={Math.floor(12 / gridColumns)} key={fb.id}>
            <Card
              elevation={2}
              sx={{
                borderRadius: '12px',
                width: 320,
                height: 200,
                p: 1,
                mx: 'auto',
              }}
            >
              <CardHeader
                avatar={<Avatar src={fb.profile_image_url} />}
                title={fb.username}
                subheader={new Date(fb.created_at).toLocaleDateString()}
              />
              <CardContent>
                <Rating value={fb.website_ratings} readOnly />
                <Box
                  className="feedbackComment"
                  mt={1}
                  sx={{
                    maxHeight: 80,
                    overflowY: 'auto',
                    boxSizing: 'border-box',
                    p: 1,
                  }}
                >
                  {fb.website_comments}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {feedbacks.length === 0 && (
          <Grid item xs={12}>
            <p className="noFeedback">No feedback available yet.</p>
          </Grid>
        )}
      </Grid>
      {totalPages > 1 && (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}

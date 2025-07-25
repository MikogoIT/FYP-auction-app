import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Typography, Rating } from '@mui/material';

/**
 * Reusable "Sold by" component
 * Props:
 * - sellerId: string or number
 * - sellerUsername: string
 * - sellerAvatar: url
 * - avgRating: number
 * - totalReviews: number
 */
export default function SoldBy({
  sellerId,
  sellerUsername,
  sellerAvatar,
  avgRating,
  totalReviews,
}) {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ marginRight: '8px', fontSize: 16 }}>Sold by:</span>
        <div
          onClick={() => navigate(`/feedback/${sellerId}`)}
          style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', textDecoration: 'none' }}
        >
          <Avatar
            src={sellerAvatar}
            alt={sellerUsername}
            sx={{ width: 32, height: 32, marginRight: '8px' }}
          />
          <div style={{ fontSize: 16 }}>
            {sellerUsername}
          </div>
        </div>
      </div>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Rating
          name="seller-rating"
          value={avgRating}
          size="small"
          readOnly
          precision={0.5}
        />
        <Typography variant="body2" sx={{ marginLeft: '4px', fontSize: 14, color: 'text.secondary' }}>
          ({totalReviews})
        </Typography>
      </Box>
    </div>
  );
}

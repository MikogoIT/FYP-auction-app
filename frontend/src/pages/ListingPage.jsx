// src/pages/ListingPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box
} from '@mui/material';

import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import CheckroomIcon      from '@mui/icons-material/Checkroom';
import DevicesIcon        from '@mui/icons-material/Devices';
import WeekendIcon        from '@mui/icons-material/Weekend';
import PhoneIphoneIcon    from '@mui/icons-material/PhoneIphone';
import ShoppingBagIcon    from '@mui/icons-material/ShoppingBag';
import CategoryIcon       from '@mui/icons-material/Category';

import TelegramFollowButtonSmall from '../components/TelegramFollowButtonSmall';

function getCategoryIcon(name) {
  const key = name.toLowerCase();
  if (key.includes('bike'))     return <DirectionsBikeIcon sx={{ fontSize: 56, color: 'text.secondary' }} />;
  if (key.includes('cloth'))    return <CheckroomIcon      sx={{ fontSize: 56, color: 'text.secondary' }} />;
  if (key.includes('electron')) return <DevicesIcon        sx={{ fontSize: 56, color: 'text.secondary' }} />;
  if (key.includes('furniture'))return <WeekendIcon        sx={{ fontSize: 56, color: 'text.secondary' }} />;
  if (key.includes('mobile')
   || key.includes('gadget'))   return <PhoneIphoneIcon    sx={{ fontSize: 56, color: 'text.secondary' }} />;
  if (key.includes('shoe'))     return <ShoppingBagIcon    sx={{ fontSize: 56, color: 'text.secondary' }} />;
  return <CategoryIcon           sx={{ fontSize: 56, color: 'text.secondary' }} />;
}

export default function ListingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/categories');
      const { categories } = await res.json();
      setCategories(categories);
    })();
  }, []);

  return (
    <Box
      className="dashboardCanvas"
      sx={{ display: 'flex' }}
    >
      <Box className="sidebarSpacer" />
      <Box className="dashboardContent" sx={{ width: '100%' }}>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontWeight: 700 }}
        >
          Browse Listings by Category
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 3,
          }}
        >
          {categories.map(cat => (
            <Card
              key={cat.id}
              variant="outlined"
              sx={{
                position: 'relative',   // for the small Telegram button
                borderRadius: 2,
                overflow: 'visible',
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/listings?category=${encodeURIComponent(cat.id)}`)}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 140,
                    bgcolor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                >
                  {getCategoryIcon(cat.name)}
                </CardMedia>

                <CardContent>
                  <Typography variant="h6">{cat.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cat.description || 'No description provided.'}
                  </Typography>
                </CardContent>
              </CardActionArea>

              {/* small floating Telegram icon */}
              <TelegramFollowButtonSmall category={cat.name} />
            </Card>
          ))}
        </Box>
      </Box>
      <Box className="sidebarSpacer" />
    </Box>
  );
}

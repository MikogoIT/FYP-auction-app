// src/pages/ListingPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
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
  if (key.includes('bike'))      return <DirectionsBikeIcon  sx={{ fontSize: 56, color: 'text.secondary' }} />;
  if (key.includes('cloth'))     return <CheckroomIcon       sx={{ fontSize: 56, color: 'text.secondary' }} />;
  if (key.includes('electron'))  return <DevicesIcon         sx={{ fontSize: 56, color: 'text.secondary' }} />;
  if (key.includes('furniture')) return <WeekendIcon         sx={{ fontSize: 56, color: 'text.secondary' }} />;
  if (key.includes('mobile') || key.includes('gadget'))
                                   return <PhoneIphoneIcon     sx={{ fontSize: 56, color: 'text.secondary' }} />;
  if (key.includes('shoe'))      return <ShoppingBagIcon      sx={{ fontSize: 56, color: 'text.secondary' }} />;
  return <CategoryIcon            sx={{ fontSize: 56, color: 'text.secondary' }} />;
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
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />

      <div className="dashboardContent">
        {/* reverted to original div */}
        <div className="profileTitle">Browse Listings by Category</div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {categories.map(cat => (
            <Card
              key={cat.id}
              variant="outlined"
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'visible',
                aspectRatio: '1 / 1',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/listings?category=${encodeURIComponent(cat.id)}`)}
                sx={{ flex: 1 }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: '50%',
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

                <CardContent sx={{ flexGrow: 0, pb: 6 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '16px',
                      fontWeight: 500,
                      overflow: 'auto',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.name}
                  </Typography>
                </CardContent>
              </CardActionArea>

              <TelegramFollowButtonSmall category={cat.name} />
            </Card>
          ))}
        </div>
      </div>

      <div className="sidebarSpacer" />
    </div>
  );
}

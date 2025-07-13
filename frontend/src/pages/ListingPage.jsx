// src/pages/ListingPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  CardActions
} from '@mui/material';

import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import DevicesIcon from '@mui/icons-material/Devices';
import WeekendIcon from '@mui/icons-material/Weekend';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CategoryIcon from '@mui/icons-material/Category';

import TelegramFollowButton from "../components/TelegramFollowButton";
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

// helper to pick an icon based on the category name
function getCategoryIcon(name) {
  const key = name.toLowerCase();
  if (key.includes('bike'))       return <DirectionsBikeIcon sx={{ fontSize: 48, color: 'text.secondary' }} />;
  if (key.includes('cloth'))      return <CheckroomIcon sx={{ fontSize: 48, color: 'text.secondary' }} />;
  if (key.includes('electron'))   return <DevicesIcon sx={{ fontSize: 48, color: 'text.secondary' }} />;
  if (key.includes('furniture'))  return <WeekendIcon sx={{ fontSize: 48, color: 'text.secondary' }} />;
  if (key.includes('mobile') || key.includes('gadget')) 
                                   return <PhoneIphoneIcon sx={{ fontSize: 48, color: 'text.secondary' }} />;
  if (key.includes('shoe'))       return <ShoppingBagIcon sx={{ fontSize: 48, color: 'text.secondary' }} />;
  // fallback
  return <CategoryIcon sx={{ fontSize: 48, color: 'text.secondary' }} />;
}

export default function ListingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load categories: ", err);
      }
    })();
  }, []);

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <div id="wideTitle" className="profileTitle">
          Browse Listings by Category
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            width: "100%",
          }}
        >
          {categories.map((cat) => (
            <Card
              key={cat.id}
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
              variant="outlined"
            >
              <CardActionArea
                onClick={() => 
                  navigate(`/listings?category=${encodeURIComponent(cat.id)}`)
                }
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 120,
                    bgcolor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getCategoryIcon(cat.name)}
                </CardMedia>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {cat.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {cat.description || "No description provided."}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <TelegramFollowButton category={cat.name} />
              </CardActions>
            </Card>
          ))}
        </div>
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}

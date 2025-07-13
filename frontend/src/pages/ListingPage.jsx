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

import TelegramFollowButton from "../components/TelegramFollowButton";

import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

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
                {/* Optional Image Placeholder */}
                <CardMedia
                  component="div"
                  sx={{
                    height: 120,
                    bgcolor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#aaa",
                    fontSize: "1.5rem",
                  }}
                >
                  {cat.name}
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

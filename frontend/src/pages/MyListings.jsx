// src/pages/MyListings.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";

import BreadcrumbsNav from "../components/BreadcrumbsNav";

export default function MyListings() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 12;

  // fetch my listings + their images
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/mylistings", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const enriched = await Promise.all(
          data.listings.map(async (item) => {
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

        setListings(enriched);
      } catch (err) {
        console.error("Failed to fetch my listings:", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPages = Math.ceil(listings.length / perPage);
  const currentPageItems = listings.slice((page - 1) * perPage, page * perPage);

  const handleEdit = (id) => navigate(`/edit/${id}`);

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer" />
      <div className="dashboardContent">
        <BreadcrumbsNav />

        {/* 2 nav Buttons */}
        <div
            className="toggleButtons"
            style={{ display: "flex", gap: 8, marginBottom: 16, width: "100%" }}
          >
          <Button
            variant="outlined"
            onClick={() => navigate("/myListings")}
            sx={{
              borderRadius: "999px",
              borderColor: "primary.main",
              color: "primary.main",
              textTransform: "none",
              '&:hover': { borderColor: 'primary.dark' },
            }}
          >
            My Listings
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/mylistings/MyListingsBids")}
            sx={{
              borderRadius: "999px",
              borderColor: "grey.400",
              color: "grey.500",
              textTransform: "none",
              '&:hover': { borderColor: 'grey.600' },
            }}
          >
            Bids On My Listings
          </Button>
        </div>

        <div id="wideTitle" className="profileTitle">
          My Listings
        </div>

        {loading ? (
          <p className="centerText">Loading…</p>
        ) : listings.length === 0 ? (
          <p className="centerText">You haven’t listed any items yet.</p>
        ) : (
          <>
            <div className="listingGrid">
              {currentPageItems.map((item) => (
                <div key={item.id} className="listingCard">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="listingImage"
                    />
                  ) : (
                    <Avatar
                      variant="square"
                      sx={{ width: "100%", height: 200, bgcolor: "#eee" }}
                    >
                      <ImageIcon sx={{ fontSize: 40, color: "#aaa" }} />
                    </Avatar>
                  )}
                  <div className="listingDetails">
                    <h3 className="listingTitle">{item.title}</h3>
                    <p className="listingCategory">
                      <strong>Category:</strong> {item.category_name || "—"}
                    </p>
                    <p className="listingDesc">{item.description}</p>
                    <p className="listingMinBid">
                      <strong>Min Bid:</strong> ${item.min_bid}
                    </p>
                    <p className="listingEndDate">
                      <strong>Ends:</strong> {new Date(item.end_date).toLocaleString()}
                    </p>
                  </div>
                  <div className="listingAction">
                    <Button
                      variant="contained"
                      onClick={() => handleEdit(item.id)}
                      sx={{
                        width: "100%",
                        backgroundColor: theme.palette.warning.light,
                        color: theme.palette.getContrastText(
                          theme.palette.warning.light
                        ),
                        '&:hover': { backgroundColor: theme.palette.warning.dark },
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="paginationControls">
                {page > 1 && (
                  <Button
                    variant="outlined"
                    onClick={() => setPage(page - 1)}
                  >
                    ← Previous
                  </Button>
                )}
                <span className="pageIndicator">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Button
                    variant="outlined"
                    onClick={() => setPage(page + 1)}
                  >
                    Next →
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className="sidebarSpacer" />
    </div>
  );
}

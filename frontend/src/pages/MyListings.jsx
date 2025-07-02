// src/pages/MyListings.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import ImageIcon from "@mui/icons-material/Image";

// Material-Web buttons
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

import ListingTabs from "../components/ListingTabs";
import "./MyListings.css";  // ← import your CSS

export default function MyListings() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 12;

  // fetch my listings + their images
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/mylistings", {
          credentials: "include",
        });
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
  const currentPageItems = listings.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const handleEdit = (id) => navigate(`/edit/${id}`);

  return (
    <div className="dashboardCanvas myListingsPage">
      <ListingTabs />

      <div className="profileTitle">My Listings</div>

      {loading ? (
        <p className="centerText">Loading…</p>
      ) : listings.length === 0 ? (
        <p className="centerText">You haven’t listed any items yet.</p>
      ) : (
        <>
          <div className="listingsGrid">
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
                  <p className="listingDesc">{item.description}</p>
                  <p className="listingMinBid">
                    <strong>Min Bid:</strong> ${item.min_bid}
                  </p>
                  <p className="listingEndDate">
                    <strong>Ends:</strong>{" "}
                    {new Date(item.end_date).toLocaleString()}
                  </p>
                  <div className="listingAction">
                    <md-filled-button
                      onClick={() => handleEdit(item.id)}
                      style={{ width: "100%" }}
                    >
                      Edit
                    </md-filled-button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="paginationControls">
              {page > 1 && (
                <md-filled-button onClick={() => setPage(page - 1)}>
                  ← Previous
                </md-filled-button>
              )}
              <span className="pageIndicator">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <md-filled-tonal-button onClick={() => setPage(page + 1)}>
                  Next →
                </md-filled-tonal-button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

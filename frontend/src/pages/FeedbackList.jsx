import React, { useEffect, useState } from "react";
import { Rating } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("latest");
  const [error, setError] = useState("");

  // Responsive grid columns
  const [gridColumns, setGridColumns] = useState(window.innerWidth < 700 ? 1 : 3);

  useEffect(() => {
    const handleResize = () => setGridColumns(window.innerWidth < 700 ? 1 : 3);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch("/api/feedback/list");
        const data = await res.json();
        if (res.ok) setFeedbacks(data);
        else setError(data.message || "Failed to load feedbacks.");
      } catch (err) {
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    if (sortOption === "latest") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortOption === "highest") {
      return b.website_ratings - a.website_ratings;
    } else if (sortOption === "lowest") {
      return a.website_ratings - b.website_ratings;
    }
    return 0;
  });

  const visibleFeedbacks = sortedFeedbacks.slice(0, 6);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: 1200, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>⭐ Website Feedback</h2>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <label htmlFor="sortOption" style={{ marginRight: 10 }}>
          Sort by:
        </label>
        <select
          id="sortOption"
          aria-label="Sort feedback"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {error && (
        <p style={{ color: "red", textAlign: "center", marginBottom: 20 }}>{error}</p>
      )}

      {visibleFeedbacks.length === 0 ? (
        <p style={{ textAlign: "center" }}>No feedback submitted yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            gap: 20,
          }}
        >
          {visibleFeedbacks.map((fb) => (
            <div
              key={fb.id}
              style={{
                borderRadius: 12,
                padding: 20,
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                border: "1px solid #ccc",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <Avatar
                  style={{ marginRight: 12 }}
                  src={fb.profile_image_url || undefined}
                  alt={fb.username}
                />
                <div>
                  <strong>{fb.username}</strong>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {new Date(fb.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <Rating value={fb.website_ratings} readOnly size="small" />
              <div
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  lineHeight: 1.6,
                  maxHeight: 120,
                  overflowY: "auto",
                  whiteSpace: "pre-line",
                }}
              >
                {fb.website_comments}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// src/pages/FeedbackList.jsx
import React, { useEffect, useState } from "react";
import { Rating } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch("/api/feedback/list");
        const data = await res.json();
        if (res.ok) setFeedbacks(data);
        else console.error("Failed to load feedbacks:", data.message);
      } catch (err) {
        console.error("Server error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: 1200, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>⭐ Website Feedback</h2>

      {feedbacks.length === 0 ? (
        <p style={{ textAlign: "center" }}>No feedback submitted yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              style={{
                borderRadius: 12,
                padding: 20,
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <Avatar style={{ marginRight: 12 }}>{fb.username[0]?.toUpperCase()}</Avatar>
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

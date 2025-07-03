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

  if (loading) return <div style={{ textAlign: "center", marginTop: 50 }}><CircularProgress /></div>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>⭐ Website Feedback</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback submitted yet.</p>
      ) : (
        feedbacks.map((fb) => (
          <div key={fb.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 16, background: "#fafafa" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <Avatar style={{ marginRight: 12 }}>{fb.username[0].toUpperCase()}</Avatar>
              <div>
                <strong>{fb.username}</strong><br />
                <Rating value={fb.website_ratings} readOnly />
              </div>
            </div>
            <p style={{ marginTop: 10 }}>{fb.website_comments}</p>
            <p style={{ fontSize: 12, color: "#777" }}>{new Date(fb.created_at).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
}

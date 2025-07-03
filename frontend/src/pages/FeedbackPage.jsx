import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Feedback() {
  const [website_comments, setComments] = useState("");
  const [website_ratings, setRatings] = useState(5);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) navigate("/login");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!website_comments.trim()) {
      setMsg("❌ Feedback cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ website_comments, website_ratings }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Thank you for your feedback!");
        setComments("");
      } else {
        setMsg("❌ " + (data.message || "Failed to submit feedback."));
      }
    } catch {
      setMsg("❌ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 30, borderRadius: 12, background: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16, background: "#eee", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>← Back</button>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Website Feedback</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Rating: </label>
          <select value={website_ratings} onChange={e => setRatings(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
          </select>
        </div>
        <textarea
          value={website_comments}
          onChange={e => setComments(e.target.value)}
          placeholder="Share your thoughts, suggestions, or issues..."
          rows={6}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "1.5px solid #ccc", fontSize: 16, marginBottom: 16 }}
        />
        <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold", fontSize: 16, cursor: "pointer" }}>
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
        {msg && <p style={{ marginTop: 14, color: msg.startsWith("✅") ? "green" : "red", fontWeight: 600 }}>{msg}</p>}
      </form>
    </div>
  );
}

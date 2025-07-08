// src/components/FeedbackForm.jsx
import { useState } from "react";

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function FeedbackForm({
  heading = "Website Feedback",
  endpoint = "/api/feedback",
  onSuccess,
  showBackButton = false,
  onBack,
}) {
  const [website_comments, setComments] = useState("");
  const [website_ratings, setRatings] = useState(5);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const wordCount = countWords(website_comments);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!website_comments.trim()) {
      setMsg("❌ Feedback cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ website_comments, website_ratings }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setMsg("❌ You have already submitted feedback.");
        setSubmitted(true);
      } else if (res.ok) {
        setMsg("✅ Thank you for your feedback!");
        setComments("");
        setSubmitted(true);
        if (onSuccess) onSuccess();
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
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        padding: 30,
        borderRadius: 12,
        background: "#fff",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>{heading}</h2>
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="website_ratings">Rating: </label>
          <select
            id="website_ratings"
            value={website_ratings}
            onChange={e => setRatings(Number(e.target.value))}
            aria-label="Website rating"
            disabled={submitted || loading}
          >
            {[5, 4, 3, 2, 1].map(n => (
              <option key={n} value={n}>
                {n} ★
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={website_comments}
          onChange={e => {
            const value = e.target.value;
            if (countWords(value) <= 100) {
              setComments(value);
            }
          }}
          placeholder="Share your thoughts, suggestions, or issues..."
          rows={6}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1.5px solid #ccc",
            fontSize: 16,
            marginBottom: 16,
            resize: "none",
            boxSizing: "border-box",
            background: submitted || loading ? "#333" : "#fff",
            color: submitted || loading ? "#aaa" : "#222",
          }}
          disabled={submitted || loading}
        />
        <div style={{ textAlign: "right", fontSize: 12, color: "#888", marginBottom: 8 }}>
          {wordCount} / 100 words
          {wordCount >= 100 && (
            <span style={{ color: "red", marginLeft: 8 }}>
              (Word limit reached)
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || submitted}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
        {msg && (
          <p
            style={{
              marginTop: 14,
              color: msg.startsWith("✅") ? "green" : "red",
              fontWeight: 600,
            }}
            aria-live="polite"
          >
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}

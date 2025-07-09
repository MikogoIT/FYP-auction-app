import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/*const FEEDBACK_TYPES = [
  { value: "Buyer", label: "Buyer" }, // Buyer Author Role
  { value: "Seller", label: "Seller" } // Seller Author Role
];*/

const MAX_WORDS = 100;

export default function UserFeedback() {
  const [sellerInput, setSellerInput] = useState(""); // Use for text input
  const [userRating, setUserRating] = useState(5);
  const [userComments, setUserComments] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const wordCount = countWords(userComments);
  const feedbackType = "Buyer"; // fixed as buyer author role

  // Enforce 100-word limit
  const handleCommentChange = (e) => {
    const value = e.target.value;
    if (countWords(value) <= MAX_WORDS) {
      setUserComments(value);
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          seller_id: sellerId,
          type: feedbackType,
          user_ratings: userRating,
          user_comments: userComments,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Thank you for your feedback!");
        setSubmitted(true);
        setUserComments("");
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
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginBottom: 16,
          background: "#eee",
          border: "none",
          borderRadius: 6,
          padding: "6px 12px",
          cursor: "pointer",
        }}
      >
        ← Back to Dashboard
      </button>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>User Feedback</h2>
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        {/*<div style={{ marginBottom: 16 }}>
          <label htmlFor="seller">Seller:</label>
          <select
            id="seller"
            value={sellerId}
            onChange={e => setSellerId(e.target.value)}
            required
            disabled={submitted || loading}
          >
            <option value="">Select Seller</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
        </div> */}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="seller">Seller Username or ID:</label>
          <input
            type="text"
            id="seller"
            value={sellerInput}
            onChange={e => setSellerInput(e.target.value)}
            placeholder="Enter seller username or ID"
            disabled={submitted || loading}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="userRating">Rating:</label>
          <select
            id="userRating"
            value={userRating}
            onChange={e => setUserRating(Number(e.target.value))}
            disabled={submitted || loading}
          >
            {[5, 4, 3, 2, 1].map(n => (
              <option key={n} value={n}>{n} ★</option>
            ))}
          </select>
        </div>
        <textarea
          value={userComments}
          onChange={handleCommentChange}
          placeholder="Share your feedback about this user..."
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
        <div
          style={{
            textAlign: "right",
            fontSize: 12,
            color: "#888",
            marginBottom: 8,
          }}
        >
          {wordCount} / {MAX_WORDS} words
          {wordCount >= MAX_WORDS && (
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

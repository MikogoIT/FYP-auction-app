import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const FEEDBACK_TYPES = [
  { value: "buyer_to_seller", label: "Buyer to Seller" },
  { value: "seller_to_buyer", label: "Seller to Buyer" }
];

const MAX_WORDS = 100;

export default function UserFeedback() {
  const [users, setUsers] = useState([]);
  const [buyerId, setBuyerId] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [feedbackType, setFeedbackType] = useState(FEEDBACK_TYPES[0].value);
  const [userRating, setUserRating] = useState(5);
  const [userComments, setUserComments] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const wordCount = countWords(userComments);

  // Fetch users on mount
  useEffect(() => {
    fetch("/api/users/all")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setUsers([]));
  }, []);

  // Enforce 100-word limit
  const handleCommentChange = (e) => {
    const value = e.target.value;
    if (countWords(value) <= MAX_WORDS) {
      setUserComments(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!userComments.trim()) {
      setMsg("❌ Feedback cannot be empty.");
      return;
    }
    if (!buyerId || !sellerId) {
      setMsg("❌ Please select both buyer and seller.");
      return;
    }
    if (buyerId === sellerId) {
      setMsg("❌ Buyer and seller cannot be the same user.");
      return;
    }
    setLoading(true);
    try {
      // Replace with your actual POST endpoint and payload
      const res = await fetch("/api/user-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          buyer_id: buyerId,
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
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="buyer">Buyer:</label>
          <select
            id="buyer"
            value={buyerId}
            onChange={e => setBuyerId(e.target.value)}
            required
            disabled={submitted || loading}
          >
            <option value="">Select Buyer</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
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
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="feedbackType">Feedback Type:</label>
          <select
            id="feedbackType"
            value={feedbackType}
            onChange={e => setFeedbackType(e.target.value)}
            required
            disabled={submitted || loading}
          >
            {FEEDBACK_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
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

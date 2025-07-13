import { useEffect, useState } from "react";
import axios from "axios";

const BidHistoryPage = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加载我的出价记录
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await axios.get("/api/bids/my", { withCredentials: true });
        setBids(response.data.bids);
      } catch (err) {
        console.error("Error fetching bids:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const handleWithdraw = async (bidId) => {
    if (!window.confirm("Are you sure you want to withdraw this bid?")) return;
    try {
      await axios.delete(`/api/bids/${bidId}`, { withCredentials: true });
      setBids((prev) => prev.filter((b) => b.bid_id !== bidId));
    } catch (err) {
      alert("Failed to withdraw bid.");
      console.error(err);
    }
  };

  if (loading) return <p>Loading bid history...</p>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>🧾 View Bid History</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>S/N</th>
            <th>Listing Name</th>
            <th>Bid Amount</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bids.length === 0 ? (
            <tr><td colSpan="8">No bids found.</td></tr>
          ) : (
            bids.map((bid, index) => (
              <tr key={bid.bid_id}>
                <td>{index + 1}</td>
                <td>{bid.listing_name}</td>
                <td>${parseFloat(bid.bid_amount).toFixed(2)}</td>
                <td>{new Date(bid.created_at).toLocaleString()}</td>
                <td>{bid.updated_at ? new Date(bid.updated_at).toLocaleString() : "N/A"}</td>
                <td>{bid.end_date ? new Date(bid.end_date).toLocaleString() : "N/A"}</td>
                <td style={{ color: getStatusColor(bid.status) }}>{bid.status}</td>
                <td>
                  <button
                    disabled={bid.status !== "Pending"}
                    onClick={() => handleWithdraw(bid.bid_id)}
                    style={{
                      backgroundColor: bid.status !== "Pending" ? "#ccc" : "#e74c3c",
                      color: "#fff",
                      border: "none",
                      padding: "5px 10px",
                      cursor: bid.status === "Pending" ? "pointer" : "not-allowed",
                      borderRadius: "4px",
                    }}
                  >
                    Withdraw Bid
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "orange";
    case "success":
      return "green";
    case "closed":
      return "gray";
    default:
      return "black";
  }
};

export default BidHistoryPage;

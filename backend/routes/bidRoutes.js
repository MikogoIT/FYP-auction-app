import express from "express";
import { sql } from "../utils/db.js";
import { verifyToken } from "../utils/token.js";

const router = express.Router();

router.post("/auction", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { auction_id, bid_amount } = req.body;
  if (!auction_id || !bid_amount) {
    return res.status(400).json({ message: "Missing bid info" });
  }

  try {
    // Get the current auction minimum bid or latest bid
    const [auction] = await sql`
      SELECT min_price FROM auctions WHERE id = ${auction_id}
    `;
    
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const [lastBid] = await sql`
      SELECT bid_amount FROM bids
      WHERE auction_id = ${auction_id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const currentPrice = lastBid ? Number(lastBid.bid_amount) : Number(auction.min_price);
    const minRequired = parseFloat((currentPrice * 1.02).toFixed(2));

    if (Number(bid_amount) < minRequired) {
      return res.status(400).json({ message: `Bid must be at least $${minRequired}` });
    }

    const result = await sql`
      INSERT INTO bids (buyer_id, auction_id, bid_amount)
      VALUES (${payload.userId}, ${auction_id}, ${bid_amount})
      RETURNING *
    `;

    res.status(201).json({ bid: result[0] });


  } catch (err) {
    console.error("Bid error:", err);
    res.status(500).json({ message: "Failed to submit bid" });
  }
});

export default router;

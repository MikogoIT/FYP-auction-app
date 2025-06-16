// controllers/bidController.js
import { verifyToken } from "../utils/token.js";
import { insertBid } from "../models/bidModel.js";
import { getAuctionMinBid } from "../models/auctionModel.js";

export async function createBid(req, res) {
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
    const minBid = await getAuctionMinBid(auction_id);
    if (!minBid) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (parseFloat(bid_amount) < parseFloat(minBid)) {
      return res.status(400).json({ message: `Bid must be at least $${minBid}` });
    }

    if (bidValue > 99999999.99) {
      return res.status(400).json({ message: "Bid amount too high, must be less than 100 million" });
    }

    const result = await insertBid(payload.userId, auction_id, bid_amount);
    res.status(201).json({ bid: result[0] });
  } catch (err) {
    console.error("Bid error:", err);
    res.status(500).json({ message: "Failed to submit bid" });
  }
}

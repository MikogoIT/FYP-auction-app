// controllers/auctionController.js
import { getAuctionMinBid } from "../models/bidModel.js";

export async function getMinBidAmount(req, res) {
  const { id } = req.params;

  try {
    const result = await getAuctionMinBid(id);
    if (!result) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const { min_bid, highest_bid } = result;
    const min_allowed = Math.max(min_bid, highest_bid || 0);

    res.status(200).json({
      min_bid,
      highest_bid,
      min_allowed
    });
  } catch (err) {
    console.error("Error fetching min bid:", err);
    res.status(500).json({ message: "Server error fetching minimum bid" });
  }
}

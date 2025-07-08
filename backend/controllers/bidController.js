// controllers/bidController.js
import {
  insertBid,
  getAuctionMinBid,
  getUserBidsWithListing,
  deleteUserBid,
} from "../models/bidModel.js";
import { insertNotification } from "../models/notificationModel.js";

import { sql } from "../utils/db.js";

export async function createBid(req, res) {
  const userId = req.session.userId;
  const { auction_id, bid_amount } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }


  if (!auction_id || !bid_amount) {
    return res.status(400).json({ message: "Missing bid info" });
  }

  try {
    const minBidData = await getAuctionMinBid(auction_id);
    if (!minBidData) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const minBid = parseFloat(minBidData.highest_bid || minBidData.min_bid);

    if (parseFloat(bid_amount) < parseFloat(minBid)) {
      return res.status(400).json({ message: `Bid must be at least $${minBid}` });
    }

    if (parseFloat(bid_amount) > 99999999.99) {
      return res.status(400).json({ message: "Bid amount too high, must be less than 100 million" });
    }

    const prevHighest = await sql`
      SELECT buyer_id FROM bids
      WHERE auction_id = ${auction_id}
      ORDER BY bid_amount DESC, created_at ASC
      LIMIT 1
    `;

    const result = await insertBid(userId, auction_id, bid_amount);

    if (prevHighest.length > 0 && prevHighest[0].buyer_id !== userId) {
      const auctionInfo = await sql`
        SELECT title FROM auction_listings WHERE id = ${auction_id}
      `;
      const auctionTitle = auctionInfo.length > 0 ? auctionInfo[0].title : `#${auction_id}`;

      await insertNotification(
        prevHighest[0].buyer_id,
        `Your bid for auction "${auctionTitle}" has been outbid.`
      );
    }

    res.status(201).json({ bid: result[0] });
  } catch (err) {
    console.error("Bid error:", err);
    res.status(500).json({ message: "Failed to submit bid" });
  }
}


export async function viewUserBids(req, res) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const bids = await getUserBidsWithListing(userId);
    res.status(200).json({ bids });
  } catch (err) {
    console.error("Failed to retrieve user bids:", err);
    res.status(500).json({ message: "Failed to retrieve bids", error: err.message });
  }
}

export async function deleteBid(req, res) {
  const userId = req.session.userId;
  const { bid_id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await deleteUserBid(userId, bid_id);
    if (result.length === 0) {
      return res.status(404).json({ message: "Bid not found or not owned by user" });
    }
    res.status(200).json({ message: "Bid withdrawn successfully", bid: result[0] });
  } catch (err) {
    console.error("Delete bid error:", err);
    res.status(500).json({ message: "Failed to delete bid" });
  }
}
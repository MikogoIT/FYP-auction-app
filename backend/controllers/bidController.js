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

  // bid_amount must be a number
  if (typeof bid_amount !== "number" || isNaN(bid_amount)) {
    return res.status(400).json({ message: "Bid amount must be a number" });
  }

  try {
    // Query auction type
    const auctionInfo = await sql`
      SELECT auction_type, title FROM auction_listings WHERE id = ${auction_id}
    `;
    if (auctionInfo.length === 0) {
      return res.status(404).json({ message: "Auction not found" });
    }
    const auctionType = auctionInfo[0].auction_type;
    const auctionTitle = auctionInfo[0].title;

    // Query the current highest/lowest bid
    const minBidData = await getAuctionMinBid(auction_id);
    let validBid = true;
    let errorMsg = "";

    if (auctionType === "ascending") {
      // Ascending auction: must be higher than the current price
      const minBid = parseFloat(minBidData.highest_bid || minBidData.min_bid);
      if (parseFloat(bid_amount) <= minBid) {
        validBid = false;
        errorMsg = `Bid must be higher than current price ($${minBid})`;
      }

    } else if (auctionType === "descending") {
      // Descending auction: must be lower than the current lowest price and not lower than 1
      const prevLowest = await sql`
        SELECT bid_amount FROM bids WHERE auction_id = ${auction_id} ORDER BY bid_amount ASC, created_at ASC LIMIT 1
      `;
      const lowestBid = prevLowest.length > 0 ? parseFloat(prevLowest[0].bid_amount) : null;
      if (lowestBid !== null && parseFloat(bid_amount) >= lowestBid) {
        validBid = false;
        errorMsg = `Bid must be lower than current lowest price ($${lowestBid})`;
      }
      if (parseFloat(bid_amount) < 1) {
        validBid = false;
        errorMsg = "Bid must be at least $1";
      }
    }

    if (!validBid) {
      return res.status(400).json({ message: errorMsg });
    }

    if (parseFloat(bid_amount) > 99999999.99) {
      return res.status(400).json({ message: "Bid amount too high, must be less than 100 million" });
    }

    if (auctionType === "ascending") {
      const prevHighest = await sql`
        SELECT buyer_id FROM bids
        WHERE auction_id = ${auction_id}
        ORDER BY bid_amount DESC, created_at ASC
        LIMIT 1
      `;

      const result = await insertBid(userId, auction_id, bid_amount);
      if (prevHighest.length > 0 && prevHighest[0].buyer_id !== userId) {
        await insertNotification(
          prevHighest[0].buyer_id,
          auction_id,
          `Your bid for auction "${auctionTitle}" has been outbid.`
        );
      }
      
      res.status(201).json({ bid: result[0] });

    } else if (auctionType === "descending") {
      // Descending auction
      const prevLowest = await sql`
        SELECT buyer_id, bid_amount FROM bids
        WHERE auction_id = ${auction_id}
        ORDER BY bid_amount ASC, created_at ASC
        LIMIT 1
      `;
      
      const result = await insertBid(userId, auction_id, bid_amount);

      // Auction ends immediately
      await sql`
        UPDATE auction_listings SET is_active = false WHERE id = ${auction_id}
      `;

      // Notify buyer of winning item
      await insertNotification(
        userId,
        auction_id,
        `🏆 You have won the item "${auctionTitle}" in the descending auction. Please pay as soon as possible.`
      );

      // Notify the seller that a buyer has completed the transaction
      const sellerInfo = await sql`
        SELECT seller_id FROM auction_listings WHERE id = ${auction_id}
      `;
      if (sellerInfo.length > 0) {
        await insertNotification(
          sellerInfo[0].seller_id,
          auction_id,
          `Your item "${auctionTitle}" has been sold in the descending auction. Please contact the buyer.`
        );
      }

      res.status(201).json({ bid: result[0] });

    } else {
      // Other types of auctions, insert directly
      const result = await insertBid(userId, auction_id, bid_amount);
      res.status(201).json({ bid: result[0] });
    }

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
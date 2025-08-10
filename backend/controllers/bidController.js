// controllers/bidController.js
import * as bidModel from "../models/bidModel.js";
import * as notificationModel from "../models/notificationModel.js";
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
  if (typeof bid_amount !== "number" || isNaN(bid_amount)) {
    return res.status(400).json({ message: "Bid amount must be a number" });
  }

  try {
    // Get auction metadata
    const auctionInfo = await sql`
      SELECT auction_type, title
      FROM auction_listings
      WHERE id = ${auction_id}
    `;
    if (auctionInfo.length === 0) {
      return res.status(404).json({ message: "Auction not found" });
    }
    const { auction_type: auctionType, title: auctionTitle } = auctionInfo[0];

    // Validate against current bids / starting bid
    const minBidData = await bidModel.getAuctionMinBid(auction_id);
    let validBid = true,
      errorMsg = "";

    if (auctionType === "ascending") {
      const minBid = parseFloat(minBidData.highest_bid || minBidData.min_bid);
      if (bid_amount <= minBid) {
        validBid = false;
        errorMsg = `Bid must be higher than current price ($${minBid})`;
      }
    } else if (auctionType === "descending") {
      const prev = await sql`
        SELECT bid_amount
        FROM bids
        WHERE auction_id = ${auction_id}
        ORDER BY bid_amount ASC, created_at ASC
        LIMIT 1
      `;
      const lowestBid =
        prev[0]?.bid_amount != null ? parseFloat(prev[0].bid_amount) : null;

      if (lowestBid !== null && bid_amount >= lowestBid) {
        validBid = false;
        errorMsg = `Bid must be lower than current lowest price ($${lowestBid})`;
      }
      if (bid_amount < 1) {
        validBid = false;
        errorMsg = "Bid must be at least $1";
      }
    }

    if (!validBid) {
      return res.status(400).json({ message: errorMsg });
    }
    if (bid_amount > 99_999_999.99) {
      return res
        .status(400)
        .json({ message: "Bid amount too high, must be under 100 million" });
    }

    // Place the bid
    if (auctionType === "ascending") {
      
      const prevHighest = await sql`
      SELECT buyer_id
      FROM bids
      WHERE auction_id = ${auction_id}
      ORDER BY bid_amount DESC, created_at ASC
      LIMIT 1`;
      

      // Mark all other bids as outbid
      await bidModel.markOthersOutbid(auction_id, userId);

      // Insert or update new bid
      const result = await bidModel.insertBid(userId, auction_id, bid_amount);

      // Notify outbid user
      
  if (prevHighest[0]?.buyer_id && prevHighest[0].buyer_id !== userId) {
    await notificationModel.insertNotification(
      prevHighest[0].buyer_id,
      auction_id,
      `[outbid] Your bid for "${auctionTitle}" has been outbid.`
    );
  }
  
      return res.status(201).json({ bid: result[0] });
    } else if (auctionType === "descending") {
      const result = await bidModel.insertBid(userId, auction_id, bid_amount);

      // End auction immediately
      await sql`
    UPDATE auction_listings
    SET is_active = false
    WHERE id = ${auction_id}
  `;

      // Notify buyer and seller
      /*
  await notificationModel.insertNotification(
    userId,
    auction_id,
    `[bid won] 🏆 You won "${auctionTitle}" in the descending auction.`
  );

  const sellerInfo = await sql`
    SELECT seller_id
    FROM auction_listings
    WHERE id = ${auction_id}
  `;
  const sellerId = sellerInfo[0]?.seller_id;
  if (sellerId) {
    await notificationModel.insertNotification(
      sellerId,
      auction_id,
      `Your item "${auctionTitle}" has been sold.`
    );
    await notificationModel.insertNotification(
      userId,
      auction_id,
      `[review] Please review the seller for "${auctionTitle}".`
    );
    await notificationModel.insertNotification(
      sellerId,
      auction_id,
      `[review] Please review the buyer for "${auctionTitle}".`
    );
  }
  */
      return res.status(201).json({ bid: result[0] });
    } else {
      // Fallback for any other auction types
      const result = await bidModel.insertBid(userId, auction_id, bid_amount);
      return res.status(201).json({ bid: result[0] });
    }
  } catch (err) {
    console.error("Bid error:", err);
    return res.status(500).json({ message: "Failed to submit bid" });
  }
}

export async function viewUserBids(req, res) {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const bids = await bidModel.getUserBidsWithListing(userId);
    return res.status(200).json({ bids });
  } catch (err) {
    console.error("Failed to retrieve user bids:", err);
    return res
      .status(500)
      .json({ message: "Failed to retrieve bids", error: err.message });
  }
}

export async function deleteBid(req, res) {
  const userId = req.session.userId;
  const { bid_id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Step 1: Get auction ID from the bid
    const auctionRes = await bidModel.getAuctionIdByBid(bid_id, userId);
    if (auctionRes.length === 0) {
      return res.status(404).json({ message: "Bid not found or not owned by you" });
    }

    const auctionId = auctionRes[0].auction_id;

    // Step 2: Delete the bid
    const result = await bidModel.deleteUserBid(userId, bid_id);
    if (result.length === 0) {
      return res.status(404).json({ message: "Bid not found or not owned by you" });
    }

    // Step 3: Find new top bid after deletion
    const topBidRes = await bidModel.findTopBid(auctionId);
    if (topBidRes.length > 0) {
      const newTopBidId = topBidRes[0].id;

      // Step 4: Set top bid status to pending
      await bidModel.setBidPending(newTopBidId);
    }

    return res.status(200).json({
      message: "Bid withdrawn successfully",
      bid: result[0]
    });

  } catch (err) {
    console.error("Delete bid error:", err);
    return res.status(500).json({ message: "Failed to delete bid" });
  }
}


export async function viewBidsOnUserListings(req, res) {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const bids = await bidModel.getBidsOnUserListings(userId);
    return res.status(200).json({ bids });
  } catch (err) {
    console.error("Failed to retrieve bids on user listings:", err);
    return res
      .status(500)
      .json({ message: "Failed to retrieve bids", error: err.message });
  }
}

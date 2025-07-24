// routes/auctionRoutes.js
import express from "express";
import { getMinBidAmount, getAuctionBidDetailsHandler } from "../controllers/auctionController.js";

const router = express.Router();

// GET /api/auctions/:id/min-bid
router.get("/:id/min-bid", getMinBidAmount);
router.get("/:id/bid-details", getAuctionBidDetailsHandler);

export default router;

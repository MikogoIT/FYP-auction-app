// routes/auctionRoutes.js
import express from "express";
import { getMinBidAmount } from "../controllers/auctionController.js";

const router = express.Router();

// GET /api/auctions/:id/min-bid
router.get("/:id/min-bid", getMinBidAmount);

export default router;

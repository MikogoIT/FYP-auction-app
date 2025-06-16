// routes/auctionRoutes.js
import express from "express";
import { getMinBidAmount } from "../controllers/auctionController.js";

const router = express.Router();

// GET /api/auctions/:id/minbid
router.get("/:id/minbid", getMinBidAmount);

export default router;

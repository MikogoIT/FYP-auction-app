import express from "express";
import {
  handleAddToWatchlist,
  handleGetWatchlist,
  handleRemoveFromWatchlist,
  handleGetRecommendedItems,
  handleGetUserInterestedCategories
} from "../controllers/watchlistController.js";

const router = express.Router();

router.post("/add", handleAddToWatchlist);
router.get("/", handleGetWatchlist);
router.delete("/remove", handleRemoveFromWatchlist);
router.get("/recommendations", handleGetRecommendedItems);
router.get("/interested-categories", handleGetUserInterestedCategories);

export default router;
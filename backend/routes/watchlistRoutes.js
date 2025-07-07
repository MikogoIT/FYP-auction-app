import express from "express";
import {
  handleAddToWatchlist,
  handleGetWatchlist,
  handleRemoveFromWatchlist,
} from "../controllers/watchlistController.js";

const router = express.Router();

router.post("/add", handleAddToWatchlist);
router.get("/", handleGetWatchlist);
router.delete("/remove", handleRemoveFromWatchlist);

export default router;
// routes/tagRoutes.js
import express from "express";
import * as tagController from "../controllers/tagController.js";
import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();

router.post("/tag", requireLogin, tagController.insertTagsWithListing);
router.get("/tag", tagController.fetchTagsForAutocomplete);
router.get("/tag/user-interests", requireLogin, tagController.fetchUserInterestedTags);
router.get("/tag/recommendations", requireLogin, tagController.fetchTagBasedRecommendations);
router.get("/tag/auction/:auctionId", tagController.fetchTagsForAuction);

export default router;

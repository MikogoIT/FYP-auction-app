// routes/feedbackRoutes.js
import express from "express";
import * as feedbackController from "../controllers/feedbackController.js";
import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();

// POST   /feedback       (requires login)
router.post(  "/",  requireLogin,  feedbackController.submitWebsiteFeedback);

// POST   /feedback/auction       (requires login)
router.post("/auction", requireLogin, feedbackController.postAuctionFeedback);

// GET    /feedback/list
router.get(  "/list",  feedbackController.getAllWebsiteFeedback);

// GET    /feedback/recent
router.get(  "/recent",  feedbackController.getRecentFeedback);

// GET    /feedback/user/:userId
router.get("/user/:userId", feedbackController.getUserFeedback);

// GET    /feedback/auction/:auctionId
router.get("/auction/:auctionId", feedbackController.getAuctionFeedback);

// GET    /feedback/ratings/:userId
router.get("/ratings/:userId", feedbackController.getUserRatings);

export default router;

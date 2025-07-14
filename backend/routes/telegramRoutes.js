// routes/telegramRoutes.js
import express from "express";
import * as telegramController from "../controllers/telegramController.js";
import { requireLogin } from "../utils/requireLogin.js";
import { requireBotAuth } from "../utils/auth.js";

const router = express.Router();

router.post("/linkTelegram", requireLogin, telegramController.linkTelegramAccount);
router.post("/unlinkTelegram", requireLogin, telegramController.unlinkTelegramAccount);
router.post("/status", requireLogin, telegramController.getTelegramStatus);

// Bot-specific routes
router.get("/listings/unposted", requireBotAuth, telegramController.fetchUnpostedListings);
router.post("/mark-posted/:listingId", requireBotAuth, telegramController.markListingPosted);
router.get("/check-account/:telegramUserId", requireBotAuth, telegramController.checkTelegramAccount);

// Bot-specific notification routes
router.get("/notifications/unsent", requireBotAuth, telegramController.fetchUnsentNotifications);
router.post("/notifications/mark-sent", requireBotAuth, telegramController.markNotificationAsSent);

// Bot-specific routes (Buyers - Manage Bidding)
router.post("/bid", requireBotAuth, telegramController.createBidFromTelegram);
router.post("/bid/withdraw", requireBotAuth, telegramController.withdrawBidFromTelegram);
router.get("/bids/user/:userId", requireBotAuth, telegramController.getBidsByTelegramUser);

// Bot-specific routes (Sellers - Manage Listing)
router.get("/listings/user/:userId", requireBotAuth, telegramController.getSellerListings);

export default router;
// routes/telegramRoutes.js
import express from "express";
import * as telegramController from "../controllers/telegramController.js";
import { requireLogin } from "../utils/requireLogin.js";
import { requireBotAuth, telegramGCPAuth } from "../utils/auth.js";

const router = express.Router();

router.post("/linkTelegram", requireLogin, telegramController.linkTelegramAccount);
router.post("/unlinkTelegram", requireLogin, telegramController.unlinkTelegramAccount);
router.post("/status", requireLogin, telegramController.getTelegramStatus);

// Bot-specific routes
router.get("/listings/unposted", requireBotAuth, telegramGCPAuth, telegramController.fetchUnpostedListings);
router.post("/mark-posted/:listingId", requireBotAuth, telegramGCPAuth, telegramController.markListingPosted);
router.get("/check-account/:telegramUserId", requireBotAuth, telegramGCPAuth, telegramController.checkTelegramAccount);
router.get("/listings/with-messages", requireBotAuth, telegramGCPAuth, telegramController.fetchListingsWithTelegramMessages);
router.post("/listings/save-message", requireBotAuth, telegramGCPAuth, telegramController.saveTelegramMessageData);

// Bot-specific notification routes
router.get("/notifications/unsent", requireBotAuth, telegramGCPAuth, telegramController.fetchUnsentNotifications);
router.post("/notifications/mark-sent", requireBotAuth, telegramGCPAuth, telegramController.markNotificationAsSent);

// Bot-specific routes (Buyers - Manage Bidding)
router.post("/bid", requireBotAuth, telegramGCPAuth, telegramController.createBidFromTelegram);
router.post("/bid/withdraw", requireBotAuth, telegramGCPAuth, telegramController.withdrawBidFromTelegram);
router.get("/bids/user/:userId", requireBotAuth, telegramGCPAuth, telegramController.getBidsByTelegramUser);

// Bot-specific routes (Buyers - Manage Watchlist)
router.post("/watchlist/add", requireBotAuth, telegramGCPAuth, telegramController.addWatchlistItem);
router.post("/watchlist/remove", requireBotAuth, telegramGCPAuth, telegramController.removeWatchlistItem);
router.get("/watchlist/user/:userId", requireBotAuth, telegramGCPAuth, telegramController.getUserWatchlist);

router.get("/recommendations/comprehensive/:userId", requireBotAuth, telegramGCPAuth, telegramController.getComprehensiveRecommendationsByUserId);

// Bot-specific routes (Sellers - Manage Listing)
router.get("/listings/user/:userId", requireBotAuth, telegramGCPAuth, telegramController.getSellerListings);

// Bot-specific listing search
router.get("/listings/search", requireBotAuth, telegramGCPAuth, telegramController.searchListings);

export default router;
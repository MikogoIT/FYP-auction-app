// routes/telegramRoutes.js
import express from "express";
import * as telegramController from "../controllers/telegramController.js";
import { requireLogin } from "../utils/requireLogin.js";

const router = express.Router();

router.post("/linkTelegram", requireLogin, telegramController.linkTelegramAccount);
router.post("/unlinkTelegram", requireLogin, telegramController.unlinkTelegramAccount);
router.post("/status", requireLogin, telegramController.getTelegramStatus);

// Bot-specific routes
router.get("/listings/unposted", requireBothAuth, telegramController.fetchUnpostedListings);
router.post("/mark-posted/:listingId", requireBothAuth, telegramController.markListingPosted);

export default router;
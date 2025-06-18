// routes/telegramRoutes.js
import express from "express";
import { linkTelegramAccount, getTelegramStatus } from "../controllers/telegramController.js";

const router = express.Router();

router.post("/linkTelegram", linkTelegramAccount);
router.post("/status", getTelegramStatus);

export default router;
// routes/telegramRoutes.js
import express from "express";
import { linkTelegramAccount, getTelegramStatus } from "../controllers/telegramController";

const router = express.Router();

router.post("/linkTelegram", linkTelegramAccount);
router.post("/status", getTelegramStatus);

export default router;
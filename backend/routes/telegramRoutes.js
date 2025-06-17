// routes/telegramRoutes.js
import express from "express";
import { linkTelegram } from "../controllers/telegramController";
//import { authenticateJWT } from "..."; --- depends on JWT implementation

const router = express.Router();

//router.post("/linkTelegram", authenticateJWT, linkTelegram);
router.post("/linkTelegram", linkTelegram);
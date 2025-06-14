// routes/bidRoutes.js
import express from "express";
import { createBid } from "../controllers/bidController.js";

const router = express.Router();

router.post("/", createBid);

export default router;

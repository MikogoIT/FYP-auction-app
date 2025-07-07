// routes/bidRoutes.js
import express from "express";
import {
  createBid,
  viewUserBids,
  deleteBid,
} from "../controllers/bidController.js";

const router = express.Router();

router.post("/", createBid);       
router.get("/MyBids", viewUserBids);     
router.delete("/:bid_id", deleteBid); 

export default router;

// routes/categoryRoutes.js
import express from "express";
import {
  createCategory,
  getCategoryById,
  updateCategory,
  toggleCategoryState,
  searchCategories,
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/", createCategory);
router.get("/", getCategories);
router.get("/search", searchCategories);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.put("/:id/toggleSuspend", toggleCategoryState);
export default router;

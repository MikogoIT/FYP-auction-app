// routes/categoryRoutes.js
import express from "express";
import {
  getAllCategoriesController,
  getActiveCategoriesController,
  createCategory,
  getCategoryById,
  updateCategory,
  toggleCategoryState,
  searchCategories,
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/", createCategory);
router.get("/", getActiveCategoriesController); // publicly-viewed active only
router.get("/admin", getAllCategoriesController); // for admin to manage visiblity
router.get("/search", searchCategories);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory); // edit
router.put("/toggleSuspend/:id", toggleCategoryState); // delete story
export default router;

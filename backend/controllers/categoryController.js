// controllers/categoryController.js
import { verifyToken } from "../utils/token.js";
import { getAllCategories, insertCategory, isAdmin } from "../models/categoryModel.js";

// get all categories
export async function getCategories(_, res) {
  try {
    const result = await getAllCategories();
    res.json({ categories: result });
  } catch (err) {
    console.error("Fetch categories error:", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
}

// create a new category
export async function createCategory(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) return res.status(401).json({ message: "Unauthorized" });

  // Check if user is admin
  const isAdminUser = await isAdmin(payload.userId);
  if (!isAdminUser) {
    return res.status(403).json({ message: "Admins only" });
  }

  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Category name is required" });

  try {
    const result = await insertCategory(name);
    res.status(201).json({ category: result[0] });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Failed to create category" });
  }
}

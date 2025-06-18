// controllers/categoryController.js
import { verifyToken } from "../utils/token.js";
import {
  getAllCategories,
  insertCategory,
  isAdmin,
  getCategoryByIdModel,
  updateCategoryModel,
  toggleCategoryStateModel,
  searchCategoriesModel,
} from "../models/categoryModel.js";

// get all categories
export async function getCategories(_, res) {
  try {
    const result = await sql`SELECT * FROM categories WHERE "is_Suspended" = FALSE`;
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

  const { name, description } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: "Category name is required" });

  try {
    const result = await insertCategory(name.trim(), description || "");
    res.status(201).json({ category: result[0] });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Failed to create category" });
  }
}

// Get details of a single category
export async function getCategoryById(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Unauthorized" });

  try {
    const category = await getCategoryByIdModel(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ category });
  } catch (err) {
    console.error("Get category error:", err);
    res.status(500).json({ message: "Failed to fetch category" });
  }
}

// update category
export async function updateCategory(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Unauthorized" });

  const isAdminUser = await isAdmin(payload.userId);
  if (!isAdminUser) return res.status(403).json({ message: "Admins only" });

  const { name, description } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });

  try {
    await updateCategoryModel(req.params.id, name.trim(), description || "");
    res.json({ message: "Category updated" });
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ message: "Failed to update category" });
  }
}

export async function toggleCategoryState(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Unauthorized" });

  const isAdminUser = await isAdmin(payload.userId);
  if (!isAdminUser) return res.status(403).json({ message: "Admins only" });

  try {
    const result = await toggleCategoryStateModel(req.params.id);
    res.json({ newState: result.is_Suspended });
  } catch (err) {
    console.error("Toggle category state error:", err);
    res.status(500).json({ message: "Failed to change category state" });
  }
}

// search category
export async function searchCategories(req, res) {
  const query = req.query.q;
  if (!query) return res.status(400).json({ message: "Search query is required" });

  try {
    const result = await searchCategoriesModel(query);
    res.json({ categories: result });
  } catch (err) {
    console.error("Search categories error:", err);
    res.status(500).json({ message: "Failed to search categories" });
  }
}


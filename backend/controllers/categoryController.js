import { sql } from "../utils/db.js";
import { verifyToken } from "../utils/token.js";

// get all categories
export async function getCategories(_, res) {
  try {
    const result = await sql`SELECT id, name FROM listing_categories ORDER BY name`;
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

  const user = await sql`SELECT is_admin FROM users WHERE id = ${payload.userId}`;
  if (!user[0]?.is_admin) {
    return res.status(403).json({ message: "Admins only" });
  }

  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Category name is required" });

  try {
    const result = await sql`
      INSERT INTO listing_categories (name)
      VALUES (${name})
      RETURNING id, name
    `;
    res.status(201).json({ category: result[0] });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Failed to create category" });
  }
}

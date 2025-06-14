// models/categoryModel.js
import { sql } from "../utils/db.js";

// get all categories
export async function getAllCategories() {
  return await sql`
    SELECT id, name FROM listing_categories ORDER BY name
  `;
}

// create a new category
export async function insertCategory(name) {
  return await sql`
    INSERT INTO listing_categories (name)
    VALUES (${name})
    RETURNING id, name
  `;
}

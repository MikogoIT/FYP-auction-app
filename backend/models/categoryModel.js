// models/categoryModel.js
import { sql } from "../utils/db.js";

// get all categories
export async function getAllCategories() {
  return await sql`
    SELECT id, name, description, is_Suspended FROM listing_categories ORDER BY name
  `;
}

// get category detail
export async function getCategoryByIdModel(id) {
  const result = await sql`
    SELECT id, name, description, is_Suspended FROM listing_categories WHERE id = ${id}
  `;
  return result[0];
}

// create a new category
export async function insertCategory(name, description) {
  return await sql`
    INSERT INTO listing_categories (name, description)
    VALUES (${name}, ${description})
    RETURNING id, name, description
  `;
}

// update category
export async function updateCategoryModel(id, name, description) {
  return await sql`
    UPDATE listing_categories
    SET name = ${name}, description = ${description}
    WHERE id = ${id}
    RETURNING id, name, description, is_Suspended
  `;
  return result[0];
}

// suspend category
export async function toggleCategoryStateModel(id) {
  return await sql`
    UPDATE listing_categories
    SET is_Suspended = NOT is_Suspended
    WHERE id = ${id}
    RETURNING is_Suspended
  `;
}

// search category
export async function searchCategoriesModel(query) {
  return await sql`
    SELECT id, name FROM listing_categories
    WHERE name ILIKE ${'%' + query + '%'}
    ORDER BY name
  `;
}

export async function isAdmin(userId) {
  const result = await sql`
    SELECT is_admin FROM users WHERE id = ${userId}
  `;
  return result[0]?.is_admin || false;
}

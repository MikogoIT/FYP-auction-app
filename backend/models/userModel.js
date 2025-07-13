// models/userModel.js
import { sql } from "../utils/db.js";

export const getUserById = async (userId) => {
  return await sql`
    SELECT username, email, phone_number, address, is_admin, is_frozen
    FROM users
    WHERE id = ${userId}
  `;
};

export const updateUserById = async (userId, username, phone_number, address) => {
  return await sql`
    UPDATE users
    SET username = ${username},
        phone_number = ${phone_number},
        address = ${address}
    WHERE id = ${userId}
    RETURNING username, email, phone_number, address
  `;
};

export const getAllUsers = async () => {
  return await sql`
    SELECT id, username, email, phone_number, address, is_admin, is_frozen
    FROM users
    ORDER BY id ASC
  `;
};

export async function toggleUserFrozenStatus(userId) {
  const current = await sql`SELECT is_frozen FROM users WHERE id = ${userId}`;
  const newStatus = !current[0].is_frozen;

  const result = await sql`
    UPDATE users SET is_frozen = ${newStatus} WHERE id = ${userId}
    RETURNING id, username, is_frozen
  `;
  return result;
}

// Use for Feedback Retrieval
export async function retrieveUserById(userId){
  return await sql`
    SELECT id, username, profile_image_url 
    FROM users
    WHERE id = ${userId}
  `;
}
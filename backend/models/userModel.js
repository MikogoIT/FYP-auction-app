// models/userModel.js
import { sql } from "../utils/db.js";

export const getUserById = async (userId) => {
  return await sql`
    SELECT username, email, phone_number, address
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
    SELECT id, username, email, phone_number, address, is_admin
    FROM users
    ORDER BY id ASC
  `;
};

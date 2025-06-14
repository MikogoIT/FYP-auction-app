// models/authModel.js
import { sql } from "../utils/db.js";

export async function findUserByEmail(email) {
  const result = await sql`
    SELECT id, email, password_hash FROM users WHERE email = ${email}
  `;
  return result[0];
}

export async function emailExists(email) {
  const result = await sql`SELECT id FROM users WHERE email = ${email}`;
  return result.length > 0;
}

export async function usernameExists(username) {
  const result = await sql`SELECT id FROM users WHERE username = ${username}`;
  return result.length > 0;
}

export async function createUser({ username, email, passwordHash, full_name, phone_number, address }) {
  const result = await sql`
    INSERT INTO users (username, email, password_hash, full_name, phone_number, address)
    VALUES (${username}, ${email}, ${passwordHash}, ${full_name}, ${phone_number}, ${address})
    RETURNING id, username, email, full_name, phone_number, address
  `;
  return result[0];
}

import sql from "./db.js";

// Get all users
export const getAllUsers = async () => {
    const result = await sql`SELECT * FROM users`;
    return result;
};

// Create a User
export const createUser = async (username, email, password) => {
    const result = await sql`
        INSERT INTO users (username, email, password_hash)
        VALUES (${username}, ${email}, ${password})
        RETURNING *`;

    return result;
}
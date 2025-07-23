// index.js
require('dotenv').config();
const express = require('express');
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL');
}

// initialize Postgres.js; you can add ssl options if you need them
export const sql = postgres(connectionString, {
//   ssl: { rejectUnauthorized: false },
});

const app = express();

// parse JSON bodies
app.use(express.json());

/**
 * Expects a POST { userId }
 * Returns { unread: <number> }
 */
app.post('/', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const [{ cnt }] = await sql`
      SELECT COUNT(*) AS cnt
      FROM notifications
      WHERE user_id = ${userId}
        AND is_read = FALSE
    `;
    return res.json({ unread: Number(cnt) });
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = { app };
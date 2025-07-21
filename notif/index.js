// index.js
require('dotenv').config();
const express = require('express');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
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
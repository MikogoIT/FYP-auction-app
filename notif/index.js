require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// GET / → return unread count
app.get('/', async (req, res) => {
  // adjust this to match how you store userId in cookies
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [{ cnt }] = await sql`
      SELECT COUNT(*) AS cnt
      FROM notifications
      WHERE user_id = ${userId}
        AND is_read = FALSE
    `;
    res.json({ unread: Number(cnt) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'DB error' });
  }
});

// Export the Express app as the function entry point
module.exports = app;

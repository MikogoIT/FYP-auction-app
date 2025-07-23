// index.js
import 'dotenv/config';    
import express from 'express';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL');
}

export const sql = postgres(connectionString, {
  // ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

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

// ESM export
export { app };

// utils/db.js
import { createClient } from '@supabase/supabase-js';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('Missing SUPABASE_DB_URL');


export const sql = createClient(dbUrl, {
//   ssl: { rejectUnauthorized: false }
});


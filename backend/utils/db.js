// utils/db.js
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL');
}

// initialize Postgres.js; you can add ssl options if you need them
export const sql = postgres(connectionString, {
//   ssl: { rejectUnauthorized: false },
});

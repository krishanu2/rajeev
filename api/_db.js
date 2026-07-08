import { Pool } from "pg";

let pool;
export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export const SLOT_TIMES = [];
for (let h = 9; h < 17; h++) {
  SLOT_TIMES.push(`${String(h).padStart(2, "0")}:00`);
  SLOT_TIMES.push(`${String(h).padStart(2, "0")}:30`);
}

export function isAdmin(req) {
  // TEMPORARY: gate disabled for testing before DATABASE_URL/ADMIN_PASSWORD
  // are set on Vercel. Restore the real check below before this goes live.
  return true;
  // const key = req.headers["x-admin-key"];
  // return !!key && key === process.env.ADMIN_PASSWORD;
}

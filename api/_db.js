import { Pool } from "pg";

let pool;
export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

// The full 24 hours is offered; which slots are actually bookable is
// entirely Rajeev's call via block/unblock in the admin.
export const SLOT_TIMES = [];
for (let h = 0; h < 24; h++) {
  SLOT_TIMES.push(`${String(h).padStart(2, "0")}:00`);
  SLOT_TIMES.push(`${String(h).padStart(2, "0")}:30`);
}

// Slot times are IST wall-clock. IST is a fixed +05:30 (no DST), so a slot's
// absolute instant is independent of server or visitor timezone.
export function slotInstant(date, time) {
  return new Date(`${date}T${time}:00+05:30`);
}

// Current IST wall-clock, derived from the absolute clock — never from the
// server's local timezone (Vercel runs UTC).
export function istNow() {
  const shifted = new Date(Date.now() + 330 * 60000);
  return { date: shifted.toISOString().slice(0, 10), time: shifted.toISOString().slice(11, 16) };
}

export function isAdmin(req) {
  // TEMPORARY: gate disabled for testing before DATABASE_URL/ADMIN_PASSWORD
  // are set on Vercel. Restore the real check below before this goes live.
  return true;
  // const key = req.headers["x-admin-key"];
  // return !!key && key === process.env.ADMIN_PASSWORD;
}

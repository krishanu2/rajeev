import { getPool, SLOT_TIMES, isAdmin } from "../_db.js";

export default async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  const { action, date, time } = req.body || {};
  if (!date || !time || !SLOT_TIMES.includes(time)) {
    res.status(400).json({ error: "date and time required" });
    return;
  }
  const pool = getPool();
  try {
    if (action === "block") {
      await pool.query(
        `insert into slot_events (slot_date, slot_time, status)
         values ($1, $2, 'blocked') on conflict (slot_date, slot_time) do nothing`,
        [date, time]
      );
    } else if (action === "unblock") {
      await pool.query(
        "delete from slot_events where slot_date = $1 and slot_time = $2 and status = 'blocked'",
        [date, time]
      );
    } else if (action === "cancel") {
      await pool.query(
        "delete from slot_events where slot_date = $1 and slot_time = $2 and status = 'booked'",
        [date, time]
      );
    } else {
      res.status(400).json({ error: "action must be block, unblock or cancel" });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

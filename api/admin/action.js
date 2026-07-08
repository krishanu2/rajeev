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
  const { action, date, time, from, to } = req.body || {};
  const dayAction = action === "block-day" || action === "unblock-day";
  const rangeAction = action === "block-range" || action === "unblock-range";
  if (!date) {
    res.status(400).json({ error: "date required" });
    return;
  }
  if (rangeAction && (!SLOT_TIMES.includes(from) || !SLOT_TIMES.includes(to) || from > to)) {
    res.status(400).json({ error: "valid from/to times required" });
    return;
  }
  if (!dayAction && !rangeAction && (!time || !SLOT_TIMES.includes(time))) {
    res.status(400).json({ error: "date and time required" });
    return;
  }
  const rangeTimes = rangeAction ? SLOT_TIMES.filter((t) => t >= from && t <= to) : [];
  const pool = getPool();
  try {
    if (action === "block-range") {
      await pool.query(
        `insert into slot_events (slot_date, slot_time, status)
         select $1::date, unnest($2::text[]), 'blocked'
         on conflict (slot_date, slot_time) do nothing`,
        [date, rangeTimes]
      );
    } else if (action === "unblock-range") {
      await pool.query(
        "delete from slot_events where slot_date = $1 and status = 'blocked' and slot_time = any($2)",
        [date, rangeTimes]
      );
    } else if (action === "block-day") {
      // Marks every remaining open slot as blocked; booked slots are untouched
      // because the primary key conflict skips them.
      await pool.query(
        `insert into slot_events (slot_date, slot_time, status)
         select $1::date, unnest($2::text[]), 'blocked'
         on conflict (slot_date, slot_time) do nothing`,
        [date, SLOT_TIMES]
      );
    } else if (action === "unblock-day") {
      await pool.query(
        "delete from slot_events where slot_date = $1 and status = 'blocked'",
        [date]
      );
    } else if (action === "block") {
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
      res.status(400).json({ error: "action must be block, unblock, cancel, block-day or unblock-day" });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

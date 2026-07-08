import { getPool, isAdmin } from "../_db.js";
import { getSheetUrl, syncClientsToSheet } from "../_sheets.js";

const STATUSES = ["lead", "active", "paused", "completed"];

export default async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const pool = getPool();
  try {
    if (req.method === "POST") {
      const { id, status, notes } = req.body || {};
      if (!id || (status === undefined && notes === undefined)) {
        res.status(400).json({ error: "id plus status and/or notes required" });
        return;
      }
      if (status !== undefined && !STATUSES.includes(status)) {
        res.status(400).json({ error: `status must be one of ${STATUSES.join(", ")}` });
        return;
      }
      await pool.query(
        `update clients set
           status = coalesce($2, status),
           notes = coalesce($3, notes)
         where id = $1`,
        [id, status ?? null, notes ?? null]
      );
      await syncClientsToSheet();
      res.status(200).json({ ok: true });
      return;
    }

    const q = (req.query.q || "").trim();
    const params = [];
    let where = "";
    if (q) {
      params.push(`%${q}%`);
      where = "where name ilike $1 or email ilike $1 or focus ilike $1";
    }
    const { rows: clients } = await pool.query(
      `select id, email, name, focus, status, notes, total_bookings,
              to_char(last_booking, 'YYYY-MM-DD') as last_booking,
              to_char(first_seen at time zone 'Asia/Kolkata', 'YYYY-MM-DD') as first_seen
       from clients ${where}
       order by last_booking desc nulls last, first_seen desc
       limit 500`,
      params
    );

    const { rows: [stats] } = await pool.query(
      `select
         (select count(*) from clients) as total_clients,
         (select count(*) from clients where first_seen > now() - interval '30 days') as new_this_month,
         (select count(*) from slot_events
           where status = 'booked'
             and slot_date between current_date and current_date + 6) as calls_next_7_days`
    );

    res.status(200).json({
      clients,
      stats: {
        totalClients: Number(stats.total_clients),
        newThisMonth: Number(stats.new_this_month),
        callsNext7Days: Number(stats.calls_next_7_days),
      },
      sheetUrl: await getSheetUrl(),
    });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

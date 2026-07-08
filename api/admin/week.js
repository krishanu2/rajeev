import { getPool, SLOT_TIMES, isAdmin } from "../_db.js";

// 7-day load overview starting from ?start (default today), powering the
// week strip in the admin schedule — booked/blocked counts per day at a glance.
export default async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const start = req.query.start;
  if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    res.status(400).json({ error: "start=YYYY-MM-DD required" });
    return;
  }
  try {
    const { rows } = await getPool().query(
      `select to_char(slot_date, 'YYYY-MM-DD') as date, status, count(*) as n
       from slot_events
       where slot_date between $1::date and $1::date + 6
       group by slot_date, status`,
      [start]
    );
    const byDate = {};
    for (const r of rows) {
      byDate[r.date] = byDate[r.date] || { booked: 0, blocked: 0 };
      byDate[r.date][r.status] = Number(r.n);
    }
    const days = [];
    const base = new Date(`${start}T00:00:00`);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const counts = byDate[iso] || { booked: 0, blocked: 0 };
      days.push({
        date: iso,
        booked: counts.booked || 0,
        blocked: counts.blocked || 0,
        open: SLOT_TIMES.length - (counts.booked || 0) - (counts.blocked || 0),
      });
    }
    res.status(200).json({ days });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

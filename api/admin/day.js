const { getPool, SLOT_TIMES, isAdmin } = require("../_db");

module.exports = async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "date=YYYY-MM-DD required" });
    return;
  }
  try {
    const { rows } = await getPool().query(
      "select slot_time, status, name, contact from slot_events where slot_date = $1",
      [date]
    );
    const byTime = new Map(rows.map((r) => [r.slot_time.slice(0, 5), r]));
    const slots = SLOT_TIMES.map((time) => {
      const row = byTime.get(time);
      return row
        ? { time, status: row.status, name: row.name, contact: row.contact }
        : { time, status: "open" };
    });
    res.status(200).json({ date, slots });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

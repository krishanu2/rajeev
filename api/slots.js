const { getPool, SLOT_TIMES } = require("./_db");

module.exports = async (req, res) => {
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "date=YYYY-MM-DD required" });
    return;
  }
  try {
    const { rows } = await getPool().query(
      "select slot_time, status from slot_events where slot_date = $1",
      [date]
    );
    const taken = new Map(rows.map((r) => [r.slot_time.slice(0, 5), r.status]));
    const slots = SLOT_TIMES.map((time) => ({ time, status: taken.get(time) || "open" }));
    res.status(200).json({ date, slots });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

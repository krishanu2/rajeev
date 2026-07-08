import { getPool, SLOT_TIMES, istNow } from "./_db.js";

export default async (req, res) => {
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
    // Slots that have already started (IST) are reported as "past" so the
    // widget can't offer a time that the booking endpoint would then reject.
    const now = istNow();
    const slots = SLOT_TIMES.map((time) => {
      const status = taken.get(time) || "open";
      if (status === "open" && (date < now.date || (date === now.date && time <= now.time))) {
        return { time, status: "past" };
      }
      return { time, status };
    });
    res.status(200).json({ date, slots });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

import { getPool, SLOT_TIMES } from "./_db.js";

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  const { date, time, name, contact } = req.body || {};
  if (!date || !time || !name || !contact || !SLOT_TIMES.includes(time)) {
    res.status(400).json({ error: "date, time, name, contact required" });
    return;
  }
  const slotDateTime = new Date(`${date}T${time}:00`);
  if (Number.isNaN(slotDateTime.getTime()) || slotDateTime < new Date()) {
    res.status(400).json({ error: "slot is in the past" });
    return;
  }
  try {
    // ON CONFLICT on the (slot_date, slot_time) primary key is what makes this
    // safe against two people booking the same slot at the same instant —
    // the database itself only lets one of the two concurrent inserts win.
    const { rowCount } = await getPool().query(
      `insert into slot_events (slot_date, slot_time, status, name, contact)
       values ($1, $2, 'booked', $3, $4)
       on conflict (slot_date, slot_time) do nothing`,
      [date, time, name, contact]
    );
    if (rowCount === 0) {
      res.status(409).json({ error: "That slot was just taken. Please pick another." });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

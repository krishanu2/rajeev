const { getPool } = require("./_db");

function pad(n) {
  return String(n).padStart(2, "0");
}

// Google Calendar can subscribe to this URL directly ("Other calendars" ->
// "From URL"). It polls periodically (not instant), which avoids needing a
// full Google OAuth app registration just to notify Rajeev of new bookings.
module.exports = async (req, res) => {
  try {
    const { rows } = await getPool().query(
      "select slot_date, slot_time, name, contact from slot_events where status = 'booked' order by slot_date, slot_time"
    );

    const events = rows
      .map((r) => {
        const [h, m] = r.slot_time.split(":").map(Number);
        const start = new Date(r.slot_date);
        start.setUTCHours(h, m, 0, 0);
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        const fmt = (d) =>
          `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
        const uid = `${r.slot_date}-${r.slot_time}@fwr-booking`;
        return [
          "BEGIN:VEVENT",
          `UID:${uid}`,
          `DTSTAMP:${fmt(new Date())}`,
          `DTSTART:${fmt(start)}`,
          `DTEND:${fmt(end)}`,
          `SUMMARY:FWR call — ${r.name}`,
          `DESCRIPTION:Contact: ${r.contact}`,
          "END:VEVENT",
        ].join("\r\n");
      })
      .join("\r\n");

    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FWR//Booking//EN", events, "END:VCALENDAR"]
      .filter(Boolean)
      .join("\r\n");

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.status(200).send(ics);
  } catch (err) {
    res.status(500).send("error");
  }
};

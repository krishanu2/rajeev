import { getPool, SLOT_TIMES } from "./_db.js";
import { buildIcs, googleCalendarLink, looksLikeEmail, sendEmail } from "./_email.js";
import { createMeetEvent } from "./_google.js";

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

    // If Rajeev's Google Calendar is connected, this creates the event with
    // a real Meet link AND makes Google itself send calendar invites to the
    // customer and admin(s) — exactly how Calendly does it. If it's not
    // connected yet, this quietly returns null and we fall back to a plain
    // confirmation email below instead.
    const meetLink = await createMeetEvent({ date, time, name, contact });
    if (meetLink) {
      await getPool().query(
        "update slot_events set meet_link = $1 where slot_date = $2 and slot_time = $3",
        [meetLink, date, time]
      );
    } else {
      const ics = buildIcs({ date, time, name, contact });
      const gcalLink = googleCalendarLink({ date, time, name });
      await Promise.allSettled([
        looksLikeEmail(contact)
          ? sendEmail({
              to: contact,
              subject: `You're booked — ${date} at ${time}`,
              html: `<p>Hey ${name},</p><p>You're confirmed for <strong>${date} at ${time}</strong> with Rajeev (FWR).</p><p><a href="${gcalLink}">Add to Google Calendar</a></p><p>See you then.</p>`,
              icsContent: ics,
            })
          : Promise.resolve(),
        process.env.ADMIN_EMAILS
          ? sendEmail({
              to: process.env.ADMIN_EMAILS.split(",").map((s) => s.trim()),
              subject: `New booking — ${date} ${time} (${name})`,
              html: `<p>New booking on the FWR site:</p><p><strong>${name}</strong> — ${contact}</p><p>${date} at ${time}</p><p><a href="${gcalLink}">Add to Google Calendar</a></p>`,
              icsContent: ics,
            })
          : Promise.resolve(),
      ]);
    }

    res.status(200).json({ ok: true, meetLink });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

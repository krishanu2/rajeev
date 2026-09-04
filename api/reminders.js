import { getPool, istNow } from "./_db.js";
import { sendGmail } from "./_gmail.js";
import { looksLikeEmail } from "./_email.js";

// Runs once a day (Vercel Cron, see vercel.json) — the free-tier ceiling
// is one run per day, which is exactly enough for "remind everyone with a
// call today, first thing in the morning." Sends each client a reminder
// email, plus one digest email to Rajeev listing the day's calls. The
// reminder_sent flag makes a second accidental run harmless (nothing gets
// emailed twice).
export default async (req, res) => {
  // Vercel automatically sends this header for cron-triggered requests when
  // a CRON_SECRET env var is set — this rejects anyone else hitting the URL.
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const { date: today } = istNow();
    const pool = getPool();
    const { rows: bookings } = await pool.query(
      `select slot_time, name, contact, meet_link
       from slot_events
       where slot_date = $1 and status = 'booked' and reminder_sent = false`,
      [today]
    );

    let sent = 0;
    for (const b of bookings) {
      if (looksLikeEmail(b.contact)) {
        const ok = await sendGmail({
          to: b.contact,
          subject: `Reminder: your call today at ${b.slot_time.slice(0, 5)} IST`,
          html: `<div style="font-family:sans-serif;line-height:1.6">
            <p>Hey ${b.name},</p>
            <p>Just a reminder — your call is today at <strong>${b.slot_time.slice(0, 5)} IST</strong>.</p>
            ${b.meet_link ? `<p><a href="${b.meet_link}">Join with Google Meet</a></p>` : ""}
            <p>See you then!</p>
          </div>`,
        });
        if (ok) sent++;
      }
      await pool.query(
        "update slot_events set reminder_sent = true where slot_date = $1 and slot_time = $2",
        [today, b.slot_time]
      );
    }

    // One digest to Rajeev so he opens his day already knowing what's on it.
    if (process.env.ADMIN_EMAILS && bookings.length > 0) {
      const list = bookings
        .map((b) => `<li>${b.slot_time.slice(0, 5)} IST — ${b.name}</li>`)
        .join("");
      await sendGmail({
        to: process.env.ADMIN_EMAILS.split(",").map((s) => s.trim()),
        subject: `Today's calls (${bookings.length}) — ${today}`,
        html: `<div style="font-family:sans-serif;line-height:1.6">
          <h2 style="margin:0 0 12px">Today's calls</h2>
          <ul>${list}</ul>
        </div>`,
      });
    }

    res.status(200).json({ ok: true, remindersSent: sent, bookingsToday: bookings.length });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

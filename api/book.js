import { getPool, SLOT_TIMES, slotInstant } from "./_db.js";
import { buildIcs, googleCalendarLink, looksLikeEmail, sendEmail } from "./_email.js";
import { createMeetEvent } from "./_google.js";
import { sendGmail } from "./_gmail.js";
import { syncClientsToSheet } from "./_sheets.js";

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  const { date, time, name, contact, phone, reason, focus, ref } = req.body || {};
  if (!date || !time || !name || !contact || !SLOT_TIMES.includes(time)) {
    res.status(400).json({ error: "date, time, name, contact required" });
    return;
  }
  if (!phone?.trim() || phone.trim().replace(/\D/g, "").length < 7) {
    res.status(400).json({ error: "a valid phone number is required" });
    return;
  }
  if (!reason?.trim()) {
    res.status(400).json({ error: "please tell us briefly why you're booking" });
    return;
  }
  // Slot times are IST wall-clock — compare against the absolute instant so
  // this check is correct no matter what timezone the server runs in.
  const slotDateTime = slotInstant(date, time);
  if (Number.isNaN(slotDateTime.getTime()) || slotDateTime < new Date()) {
    res.status(400).json({ error: "slot is in the past" });
    return;
  }
  try {
    // A referral code (from the ?ref= link, carried in via the client's
    // localStorage) is only ever trusted if it matches a real affiliate row —
    // an unknown/typo'd/tampered code is silently dropped, never blocks the
    // booking itself.
    let referredBy = null;
    let referredByName = null;
    if (ref) {
      const { rows: affRows } = await getPool().query(
        "select code, name from affiliates where code = $1",
        [String(ref).trim().toUpperCase()]
      );
      if (affRows.length) {
        referredBy = affRows[0].code;
        referredByName = affRows[0].name;
      }
    }

    // ON CONFLICT on the (slot_date, slot_time) primary key is what makes this
    // safe against two people booking the same slot at the same instant —
    // the database itself only lets one of the two concurrent inserts win.
    const { rowCount } = await getPool().query(
      `insert into slot_events (slot_date, slot_time, status, name, contact, phone, reason, focus, referred_by)
       values ($1, $2, 'booked', $3, $4, $5, $6, $7, $8)
       on conflict (slot_date, slot_time) do nothing`,
      [date, time, name, contact, phone.trim(), reason.trim().slice(0, 300), focus || null, referredBy]
    );
    if (rowCount === 0) {
      res.status(409).json({ error: "That slot was just taken. Please pick another." });
      return;
    }

    // Every booking creates or refreshes a CRM record, keyed on the email.
    // A repeat client keeps their status/notes; only the booking counters and
    // (if newly provided) focus area move.
    // referred_by is "first touch wins" — a repeat client keeps whoever
    // originally referred them, even if a later booking arrives with no
    // ref code (or a different one) attached.
    await getPool().query(
      `insert into clients (email, name, phone, focus, referred_by, last_booking, total_bookings)
       values ($1, $2, $3, $4, $5, $6, 1)
       on conflict (email) do update set
         name = excluded.name,
         phone = excluded.phone,
         focus = coalesce(excluded.focus, clients.focus),
         referred_by = coalesce(clients.referred_by, excluded.referred_by),
         last_booking = excluded.last_booking,
         total_bookings = clients.total_bookings + 1`,
      [contact.trim().toLowerCase(), name.trim(), phone.trim(), focus || null, referredBy, date]
    );

    // If Rajeev's Google Calendar is connected, this creates the event with
    // a real Meet link AND makes Google itself send calendar invites to the
    // customer and admin(s) — exactly how Calendly does it. If it's not
    // connected yet, this quietly returns null and we fall back to a plain
    // confirmation email below instead.
    const meetLink = await createMeetEvent({ date, time, name, contact, phone, reason, focus });
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

    // Rajeev is the ORGANIZER of the calendar event, and Google only emails
    // guests — never the organizer — so his "new booking" alert is sent
    // explicitly here, from his own Gmail to his own inbox.
    if (process.env.ADMIN_EMAILS) {
      await sendGmail({
        to: process.env.ADMIN_EMAILS.split(",").map((s) => s.trim()),
        subject: `New booking: ${name} — ${date} at ${time} IST`,
        html: `<div style="font-family:sans-serif;line-height:1.6">
          <h2 style="margin:0 0 12px">New consultation booked</h2>
          <p style="margin:0"><strong>${name}</strong></p>
          <p style="margin:0">${contact}</p>
          <p style="margin:0">📞 ${phone}</p>
          <p style="margin:8px 0 0">Reason: ${reason.trim().slice(0, 300)}</p>
          ${focus ? `<p style="margin:0">Focus area: <strong>${focus}</strong></p>` : ""}
          ${referredByName ? `<p style="margin:8px 0 0;color:#b8860b">🔗 Referred by: <strong>${referredByName}</strong></p>` : ""}
          <p style="margin:12px 0 0"><strong>${date} at ${time} IST</strong> (30 min)</p>
          ${meetLink ? `<p style="margin:12px 0 0"><a href="${meetLink}">Join with Google Meet</a></p>` : ""}
          <p style="margin:16px 0 0;color:#888;font-size:13px">The event is already on your Google Calendar.
          Manage bookings at <a href="https://fitwithrajeev.com/admin">fitwithrajeev.com/admin</a></p>
        </div>`,
      });
    }

    // Mirror the updated client list to the Google Sheet. Must be awaited —
    // Vercel freezes the function after the response — but never allowed to
    // fail the booking itself (it no-ops until Google is connected).
    await syncClientsToSheet();

    res.status(200).json({ ok: true, meetLink });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

import { getPool } from "./_db.js";
import { looksLikeEmail } from "./_email.js";

async function getRefreshToken() {
  const { rows } = await getPool().query(
    "select refresh_token from oauth_tokens where provider = 'google' limit 1"
  );
  return rows[0]?.refresh_token || null;
}

export async function getAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    console.error("Google token refresh failed", await res.text());
    return null;
  }
  const data = await res.json();
  return data.access_token;
}

// Creates the event directly on Rajeev's connected Google Calendar with a
// generated Meet link and the customer as an attendee. sendUpdates=all makes
// Google itself email a real calendar invite to both people — the same
// mechanism Calendly relies on. Returns null (silently) if Google Calendar
// hasn't been connected yet via /api/auth/google, so bookings still work
// without it, just without the Meet link.
export async function createMeetEvent({ date, time, name, contact, phone, reason, focus }) {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  // Slot times are IST wall-clock; anchor to +05:30 explicitly so the event
  // lands at the right instant even though the server itself runs in UTC.
  // 15-minute event, matching the "15 minutes" the site promises (slots
  // stay 30 min apart, giving Rajeev a buffer between calls).
  const start = new Date(`${date}T${time}:00+05:30`);
  const end = new Date(start.getTime() + 15 * 60 * 1000);

  const attendees = [];
  if (looksLikeEmail(contact)) attendees.push({ email: contact.trim() });
  if (process.env.ADMIN_EMAILS) {
    for (const email of process.env.ADMIN_EMAILS.split(",")) {
      const trimmed = email.trim();
      if (looksLikeEmail(trimmed)) attendees.push({ email: trimmed });
    }
  }

  try {
    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: `${name} and Rajeev`,
          // Phone in the location field — that's how Calendly makes the
          // number show right under the time in the calendar list view.
          location: phone || undefined,
          description: `Booked via the FWR (Fit with Rajeev) website.\nEmail: ${contact}${phone ? `\nPhone: ${phone}` : ""}${reason ? `\nReason: ${reason}` : ""}${focus ? `\nFocus area: ${focus}` : ""}`,
          start: { dateTime: start.toISOString(), timeZone: "Asia/Kolkata" },
          end: { dateTime: end.toISOString(), timeZone: "Asia/Kolkata" },
          attendees,
          conferenceData: {
            createRequest: {
              requestId: `${date}-${time}-${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        }),
      }
    );
    if (!res.ok) {
      console.error("Calendar event creation failed", await res.text());
      return null;
    }
    const event = await res.json();
    return event.hangoutLink || null;
  } catch (err) {
    console.error("Calendar event creation error", err);
    return null;
  }
}

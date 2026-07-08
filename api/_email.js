function pad(n) {
  return String(n).padStart(2, "0");
}

function fmtUtc(d) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

function slotTimes(date, time) {
  const [h, m] = time.split(":").map(Number);
  const start = new Date(date);
  start.setUTCHours(h, m, 0, 0);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return { start, end };
}

export function buildIcs({ date, time, name, contact }) {
  const { start, end } = slotTimes(date, time);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FWR//Booking//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${date}-${time}@fwr-booking`,
    `DTSTAMP:${fmtUtc(new Date())}`,
    `DTSTART:${fmtUtc(start)}`,
    `DTEND:${fmtUtc(end)}`,
    `SUMMARY:FWR coaching call — ${name}`,
    `DESCRIPTION:Contact: ${contact}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarLink({ date, time, name }) {
  const { start, end } = slotTimes(date, time);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `FWR coaching call — ${name}`,
    dates: `${fmtUtc(start)}/${fmtUtc(end)}`,
    details: "Booked via the FWR (Fit with Rajeev) site.",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function looksLikeEmail(str) {
  return typeof str === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
}

// Sends via Resend's REST API directly (no SDK dependency). Silently no-ops
// if RESEND_API_KEY isn't configured, so a missing email setup never breaks
// the booking flow itself.
export async function sendEmail({ to, subject, html, icsContent }) {
  if (!process.env.RESEND_API_KEY) return { skipped: true };
  const from = process.env.FROM_EMAIL || "FWR Bookings <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        attachments: icsContent
          ? [{ filename: "fwr-call.ics", content: Buffer.from(icsContent).toString("base64") }]
          : undefined,
      }),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
    return { ok: res.ok };
  } catch (err) {
    console.error("Email send failed", err);
    return { ok: false };
  }
}

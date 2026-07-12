import { getAccessToken } from "./_google.js";

function b64url(str) {
  return Buffer.from(str, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Sends an email from Rajeev's own Gmail account (requires the gmail.send
// scope granted during Connect Google). Never throws — the booking flow
// must never fail because a notification couldn't be sent.
export async function sendGmail({ to, subject, html }) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return false;
    const raw = [
      `To: ${Array.isArray(to) ? to.join(", ") : to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      'Content-Type: text/html; charset="UTF-8"',
      "",
      html,
    ].join("\r\n");
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw: b64url(raw) }),
    });
    if (!res.ok) console.error("Gmail send failed", await res.text());
    return res.ok;
  } catch (err) {
    console.error("Gmail send error", err);
    return false;
  }
}

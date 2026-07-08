import { getPool } from "../_db.js";

// Step 2: Google redirects back here with a one-time code. Exchange it for a
// refresh token and store it — this is the credential that lets the site
// create calendar events (with a Meet link) on Rajeev's calendar forever
// after, with no further login needed.
export default async (req, res) => {
  const { code, error } = req.query;
  if (error) {
    res.status(400).send(`Google declined: ${error}`);
    return;
  }
  if (!code) {
    res.status(400).send("Missing code");
    return;
  }
  const redirectUri = `https://${req.headers.host}/api/auth/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok) {
      res.status(500).send(`<pre>Token exchange failed: ${JSON.stringify(data, null, 2)}</pre>`);
      return;
    }
    if (!data.refresh_token) {
      res
        .status(200)
        .send(
          "Google didn't return a refresh token (this happens if you've connected before). Go to https://myaccount.google.com/permissions, remove access for this app, then visit /api/auth/google again."
        );
      return;
    }

    await getPool().query(
      `insert into oauth_tokens (provider, refresh_token, updated_at)
       values ('google', $1, now())
       on conflict (provider) do update set refresh_token = excluded.refresh_token, updated_at = now()`,
      [data.refresh_token]
    );

    res.status(200).send("Google Calendar connected. New bookings will now get a Meet link and calendar invite automatically. You can close this tab.");
  } catch (err) {
    res.status(500).send("Something went wrong connecting Google Calendar.");
  }
};

// Step 1 of the one-time Google Calendar connection: redirects Rajeev to
// Google's consent screen. Visit /api/auth/google once, logged in as the
// Google account whose calendar should host the coaching calls.
export default async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(500).send("GOOGLE_CLIENT_ID is not configured yet.");
    return;
  }
  const redirectUri = `https://${req.headers.host}/api/auth/callback`;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    // calendar.events → Meet links + invites; spreadsheets → the auto-synced
    // "FWR Clients" sheet. One consent covers both.
    scope: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/spreadsheets",
    access_type: "offline",
    prompt: "consent",
  });
  res.writeHead(302, { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  res.end();
};

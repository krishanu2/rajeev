import { getPool } from "./_db.js";

// Public (no auth) — fired once per real click on a referral link, from
// App.tsx. Logs the click AND hands back the affiliate's name in the same
// response, so the frontend can show "Arpita sent you here" without a
// second round trip. An unknown/typo'd code is just ignored — this must
// never throw or block the page for a real visitor.
export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  const code = String(req.body?.code || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{2,14}$/.test(code)) {
    res.status(400).json({ error: "invalid code" });
    return;
  }
  try {
    const { rows } = await getPool().query("select name from affiliates where code = $1", [code]);
    if (rows.length === 0) {
      res.status(404).json({ error: "unknown code" });
      return;
    }
    await getPool().query("insert into affiliate_clicks (code) values ($1)", [code]);
    res.status(200).json({ ok: true, name: rows[0].name });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

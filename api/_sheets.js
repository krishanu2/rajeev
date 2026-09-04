import { getPool } from "./_db.js";
import { getAccessToken } from "./_google.js";

// The sheet is a mirror of the clients table, not the source of truth — the
// whole tab is rewritten from Postgres on every sync. That makes the sync
// idempotent and means the first sync after Rajeev connects Google backfills
// every client who ever booked, not just the ones from that point on.

async function getConfig(key) {
  const { rows } = await getPool().query("select value from app_config where key = $1", [key]);
  return rows[0]?.value || null;
}

async function setConfig(key, value) {
  await getPool().query(
    `insert into app_config (key, value) values ($1, $2)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [key, value]
  );
}

async function ensureSpreadsheet(accessToken) {
  const existing = await getConfig("sheet_id");
  if (existing) return existing;
  const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      properties: { title: "FWR Clients" },
      sheets: [{ properties: { title: "Clients" } }],
    }),
  });
  if (!res.ok) {
    console.error("Spreadsheet creation failed", await res.text());
    return null;
  }
  const sheet = await res.json();
  await setConfig("sheet_id", sheet.spreadsheetId);
  await setConfig("sheet_url", sheet.spreadsheetUrl);
  return sheet.spreadsheetId;
}

export async function getSheetUrl() {
  return getConfig("sheet_url");
}

// Rewrites the Clients tab from the database. Silently no-ops when Google
// isn't connected yet — callers must never let a sheet failure break a booking.
export async function syncClientsToSheet() {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return;
    const sheetId = await ensureSpreadsheet(accessToken);
    if (!sheetId) return;

    const { rows } = await getPool().query(
      `select c.name, c.email, c.phone, c.focus, c.status, c.notes, c.total_bookings,
              a.name as referred_by_name,
              to_char(c.last_booking, 'YYYY-MM-DD') as last_booking,
              to_char(c.first_seen at time zone 'Asia/Kolkata', 'YYYY-MM-DD') as first_seen
       from clients c
       left join affiliates a on a.code = c.referred_by
       order by c.last_booking desc nulls last, c.first_seen desc`
    );
    const values = [
      ["Name", "Email", "Phone", "Focus area", "Status", "Notes", "Total bookings", "Last booking", "First seen", "Referred by"],
      ...rows.map((r) => [
        r.name, r.email, r.phone || "", r.focus || "", r.status, r.notes,
        String(r.total_bookings), r.last_booking || "", r.first_seen, r.referred_by_name || "",
      ]),
    ];

    const base = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values`;
    // Clear first so rows deleted from the DB don't linger at the bottom.
    await fetch(`${base}/Clients!A:J:clear`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const res = await fetch(`${base}/Clients!A1?valueInputOption=RAW`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    });
    if (!res.ok) console.error("Sheet sync failed", await res.text());
  } catch (err) {
    console.error("Sheet sync error", err);
  }
}

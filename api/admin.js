import { getPool, SLOT_TIMES, isAdmin } from "./_db.js";
import { getSheetUrl, syncClientsToSheet } from "./_sheets.js";

// All admin operations live in ONE serverless function, dispatched on ?op=
// (a vercel.json rewrite maps /api/admin/<op> here) — Vercel's Hobby plan
// allows only 12 functions per deployment, and separate files blew past it.

const STATUSES = ["lead", "active", "paused", "completed"];
const GALLERY_NAME_MAX = 40;
const GALLERY_REVIEW_MAX = 90;

function looksLikeImage(str) {
  return typeof str === "string" && str.startsWith("data:image/") && str.length < 400000;
}

// Swap sort_order with the neighbour in the chosen direction; falls back to
// index-based values if legacy rows share a sort_order.
async function moveRow(pool, table, id, dir) {
  const { rows } = await pool.query(`select id, sort_order from ${table} order by sort_order asc, id asc`);
  const idx = rows.findIndex((r) => r.id === id);
  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapWith < 0 || swapWith >= rows.length) return;
  const a = rows[idx];
  const b = rows[swapWith];
  const aOrder = a.sort_order === b.sort_order ? swapWith + 1 : b.sort_order;
  const bOrder = a.sort_order === b.sort_order ? idx + 1 : a.sort_order;
  await pool.query(`update ${table} set sort_order = $2 where id = $1`, [a.id, aOrder]);
  await pool.query(`update ${table} set sort_order = $2 where id = $1`, [b.id, bOrder]);
}

async function opDay(req, res, pool) {
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "date=YYYY-MM-DD required" });
    return;
  }
  const { rows } = await pool.query(
    "select slot_time, status, name, contact, phone, reason, meet_link, focus from slot_events where slot_date = $1",
    [date]
  );
  const byTime = new Map(rows.map((r) => [r.slot_time.slice(0, 5), r]));
  const slots = SLOT_TIMES.map((time) => {
    const row = byTime.get(time);
    return row
      ? {
          time,
          status: row.status,
          name: row.name,
          contact: row.contact,
          phone: row.phone,
          reason: row.reason,
          meetLink: row.meet_link,
          focus: row.focus,
        }
      : { time, status: "open" };
  });
  res.status(200).json({ date, slots });
}

async function opWeek(req, res, pool) {
  const start = req.query.start;
  if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    res.status(400).json({ error: "start=YYYY-MM-DD required" });
    return;
  }
  const { rows } = await pool.query(
    `select to_char(slot_date, 'YYYY-MM-DD') as date, status, count(*) as n
     from slot_events
     where slot_date between $1::date and $1::date + 6
     group by slot_date, status`,
    [start]
  );
  const byDate = {};
  for (const r of rows) {
    byDate[r.date] = byDate[r.date] || { booked: 0, blocked: 0 };
    byDate[r.date][r.status] = Number(r.n);
  }
  const days = [];
  const base = new Date(`${start}T00:00:00`);
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const counts = byDate[iso] || { booked: 0, blocked: 0 };
    days.push({
      date: iso,
      booked: counts.booked || 0,
      blocked: counts.blocked || 0,
      open: SLOT_TIMES.length - (counts.booked || 0) - (counts.blocked || 0),
    });
  }
  res.status(200).json({ days });
}

async function opAction(req, res, pool) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  const { action, date, time, from, to } = req.body || {};
  const dayAction = action === "block-day" || action === "unblock-day";
  const rangeAction = action === "block-range" || action === "unblock-range";
  if (!date) {
    res.status(400).json({ error: "date required" });
    return;
  }
  if (rangeAction && (!SLOT_TIMES.includes(from) || !SLOT_TIMES.includes(to) || from > to)) {
    res.status(400).json({ error: "valid from/to times required" });
    return;
  }
  if (!dayAction && !rangeAction && (!time || !SLOT_TIMES.includes(time))) {
    res.status(400).json({ error: "date and time required" });
    return;
  }
  const rangeTimes = rangeAction ? SLOT_TIMES.filter((t) => t >= from && t <= to) : [];
  if (action === "block-range") {
    await pool.query(
      `insert into slot_events (slot_date, slot_time, status)
       select $1::date, unnest($2::text[])::time, 'blocked'
       on conflict (slot_date, slot_time) do nothing`,
      [date, rangeTimes]
    );
  } else if (action === "unblock-range") {
    await pool.query(
      "delete from slot_events where slot_date = $1 and status = 'blocked' and slot_time = any($2)",
      [date, rangeTimes]
    );
  } else if (action === "block-day") {
    await pool.query(
      `insert into slot_events (slot_date, slot_time, status)
       select $1::date, unnest($2::text[])::time, 'blocked'
       on conflict (slot_date, slot_time) do nothing`,
      [date, SLOT_TIMES]
    );
  } else if (action === "unblock-day") {
    await pool.query("delete from slot_events where slot_date = $1 and status = 'blocked'", [date]);
  } else if (action === "block") {
    await pool.query(
      `insert into slot_events (slot_date, slot_time, status)
       values ($1, $2, 'blocked') on conflict (slot_date, slot_time) do nothing`,
      [date, time]
    );
  } else if (action === "unblock") {
    await pool.query(
      "delete from slot_events where slot_date = $1 and slot_time = $2 and status = 'blocked'",
      [date, time]
    );
  } else if (action === "cancel") {
    await pool.query(
      "delete from slot_events where slot_date = $1 and slot_time = $2 and status = 'booked'",
      [date, time]
    );
  } else {
    res.status(400).json({ error: "unknown action" });
    return;
  }
  res.status(200).json({ ok: true });
}

async function opClients(req, res, pool) {
  if (req.method === "POST") {
    const { id, status, notes } = req.body || {};
    if (!id || (status === undefined && notes === undefined)) {
      res.status(400).json({ error: "id plus status and/or notes required" });
      return;
    }
    if (status !== undefined && !STATUSES.includes(status)) {
      res.status(400).json({ error: `status must be one of ${STATUSES.join(", ")}` });
      return;
    }
    await pool.query(
      "update clients set status = coalesce($2, status), notes = coalesce($3, notes) where id = $1",
      [id, status ?? null, notes ?? null]
    );
    await syncClientsToSheet();
    res.status(200).json({ ok: true });
    return;
  }
  const q = (req.query.q || "").trim();
  const params = [];
  let where = "";
  if (q) {
    params.push(`%${q}%`);
    where = "where name ilike $1 or email ilike $1 or focus ilike $1";
  }
  const { rows: clients } = await pool.query(
    `select id, email, name, phone, focus, status, notes, total_bookings,
            to_char(last_booking, 'YYYY-MM-DD') as last_booking,
            to_char(first_seen at time zone 'Asia/Kolkata', 'YYYY-MM-DD') as first_seen
     from clients ${where}
     order by last_booking desc nulls last, first_seen desc
     limit 500`,
    params
  );
  const { rows: [stats] } = await pool.query(
    `select
       (select count(*) from clients) as total_clients,
       (select count(*) from clients where first_seen > now() - interval '30 days') as new_this_month,
       (select count(*) from slot_events
         where status = 'booked'
           and slot_date between (now() at time zone 'Asia/Kolkata')::date
                             and (now() at time zone 'Asia/Kolkata')::date + 6) as calls_next_7_days`
  );
  res.status(200).json({
    clients,
    stats: {
      totalClients: Number(stats.total_clients),
      newThisMonth: Number(stats.new_this_month),
      callsNext7Days: Number(stats.calls_next_7_days),
    },
    sheetUrl: await getSheetUrl(),
  });
}

async function opFaqs(req, res, pool) {
  if (req.method === "POST") {
    const { action, id, question, answer, dir } = req.body || {};
    if (action === "add") {
      if (!question?.trim() || !answer?.trim()) {
        res.status(400).json({ error: "question and answer required" });
        return;
      }
      await pool.query(
        `insert into faqs (question, answer, sort_order)
         values ($1, $2, (select coalesce(max(sort_order), 0) + 1 from faqs))`,
        [question.trim(), answer.trim()]
      );
    } else if (action === "update") {
      if (!id || !question?.trim() || !answer?.trim()) {
        res.status(400).json({ error: "id, question and answer required" });
        return;
      }
      await pool.query("update faqs set question = $2, answer = $3 where id = $1", [id, question.trim(), answer.trim()]);
    } else if (action === "delete") {
      if (!id) {
        res.status(400).json({ error: "id required" });
        return;
      }
      await pool.query("delete from faqs where id = $1", [id]);
    } else if (action === "move") {
      if (!id || (dir !== "up" && dir !== "down")) {
        res.status(400).json({ error: "id and dir (up|down) required" });
        return;
      }
      await moveRow(pool, "faqs", id, dir);
    } else {
      res.status(400).json({ error: "action must be add, update, delete or move" });
      return;
    }
  }
  const { rows: faqs } = await pool.query(
    "select id, question, answer, sort_order from faqs order by sort_order asc, id asc"
  );
  res.status(200).json({ ok: true, faqs });
}

async function opGallery(req, res, pool) {
  if (req.method === "POST") {
    const { action, id, name, review, before, after, dir } = req.body || {};
    if (action === "add") {
      if (!name?.trim() || !review?.trim() || !looksLikeImage(after)) {
        res.status(400).json({ error: "name, review and an after photo are required" });
        return;
      }
      if (before && !looksLikeImage(before)) {
        res.status(400).json({ error: "before photo is not a valid image" });
        return;
      }
      await pool.query(
        `insert into gallery (name, review, before_img, after_img, sort_order)
         values ($1, $2, $3, $4, (select coalesce(max(sort_order), 0) + 1 from gallery))`,
        [name.trim().slice(0, GALLERY_NAME_MAX), review.trim().slice(0, GALLERY_REVIEW_MAX), before || null, after]
      );
    } else if (action === "delete") {
      if (!id) {
        res.status(400).json({ error: "id required" });
        return;
      }
      await pool.query("delete from gallery where id = $1", [id]);
    } else if (action === "move") {
      if (!id || (dir !== "up" && dir !== "down")) {
        res.status(400).json({ error: "id and dir (up|down) required" });
        return;
      }
      await moveRow(pool, "gallery", id, dir);
    } else {
      res.status(400).json({ error: "action must be add, delete or move" });
      return;
    }
  }
  const { rows: items } = await pool.query(
    "select id, name, review, before_img, after_img from gallery order by sort_order asc, id asc"
  );
  res.status(200).json({ ok: true, items });
}

const OPS = { day: opDay, week: opWeek, action: opAction, clients: opClients, faqs: opFaqs, gallery: opGallery };

export default async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const handler = OPS[req.query.op];
  if (!handler) {
    res.status(404).json({ error: "unknown admin operation" });
    return;
  }
  try {
    await handler(req, res, getPool());
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

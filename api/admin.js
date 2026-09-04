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
    `select se.slot_time, se.status, se.name, se.contact, se.phone, se.reason, se.meet_link, se.focus,
            a.name as referred_by_name
     from slot_events se
     left join affiliates a on a.code = se.referred_by
     where se.slot_date = $1`,
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
          referredByName: row.referred_by_name,
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
    where = "where c.name ilike $1 or c.email ilike $1 or c.focus ilike $1";
  }
  const { rows: clients } = await pool.query(
    `select c.id, c.email, c.name, c.phone, c.focus, c.status, c.notes, c.total_bookings,
            a.name as referred_by_name,
            to_char(c.last_booking, 'YYYY-MM-DD') as last_booking,
            to_char(c.first_seen at time zone 'Asia/Kolkata', 'YYYY-MM-DD') as first_seen
     from clients c
     left join affiliates a on a.code = c.referred_by
     ${where}
     order by c.last_booking desc nulls last, c.first_seen desc
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

const AFFILIATE_NAME_MAX = 40;

// Builds a short, shareable, unique code from the affiliate's name
// (e.g. "Arpita" -> "ARPITA4F2") — readable enough that Rajeev can tell
// whose link it is just by glancing at the code, random suffix so two
// affiliates with similar names never collide.
function makeAffiliateCode(name) {
  const base = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "REF";
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${rand}`.slice(0, 14);
}

async function opAffiliates(req, res, pool) {
  if (req.method === "POST") {
    const { action, id, name } = req.body || {};
    if (action === "add") {
      if (!name?.trim()) {
        res.status(400).json({ error: "a name is required" });
        return;
      }
      // Collision odds are astronomically low (4 random base-36 chars), but
      // check anyway rather than trust luck — retry a handful of times.
      let code = null;
      for (let i = 0; i < 6; i++) {
        const candidate = makeAffiliateCode(name);
        const { rows } = await pool.query("select 1 from affiliates where code = $1", [candidate]);
        if (rows.length === 0) {
          code = candidate;
          break;
        }
      }
      if (!code) {
        res.status(500).json({ error: "could not generate a unique code, try again" });
        return;
      }
      await pool.query("insert into affiliates (name, code) values ($1, $2)", [
        name.trim().slice(0, AFFILIATE_NAME_MAX),
        code,
      ]);
    } else if (action === "delete") {
      if (!id) {
        res.status(400).json({ error: "id required" });
        return;
      }
      // Referred clients/bookings keep their referred_by code untouched —
      // deleting an affiliate only removes it from this management list, it
      // never rewrites history.
      await pool.query("delete from affiliates where id = $1", [id]);
    } else {
      res.status(400).json({ error: "action must be add or delete" });
      return;
    }
  }

  // Sorted as a leaderboard — whoever has referred the most people leads.
  const { rows: affiliates } = await pool.query(
    `select a.id, a.name, a.code,
            to_char(a.created_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD') as created_at,
            (select count(*) from clients c where c.referred_by = a.code) as referral_count,
            (select count(*) from affiliate_clicks ac where ac.code = a.code) as click_count
     from affiliates a
     order by referral_count desc, a.created_at desc`
  );
  const { rows: referred } = await pool.query(
    "select name, referred_by from clients where referred_by is not null"
  );
  const byCode = {};
  for (const r of referred) {
    (byCode[r.referred_by] ||= []).push(r.name);
  }
  res.status(200).json({
    ok: true,
    affiliates: affiliates.map((a) => {
      const clicks = Number(a.click_count);
      const referrals = Number(a.referral_count);
      return {
        id: a.id,
        name: a.name,
        code: a.code,
        createdAt: a.created_at,
        referralCount: referrals,
        clickCount: clicks,
        // Null (not 0%) when there's no click data yet — the UI shows
        // "—" instead of a misleading "0%".
        conversionRate: clicks > 0 ? Math.round((referrals / clicks) * 100) : null,
        referredNames: byCode[a.code] || [],
      };
    }),
  });
}

// Plain-language business insights — every number here comes straight from
// real bookings, nothing simulated. Kept deliberately simple (a few
// sentences + short bar lists) rather than a full charting library, so a
// first-time computer user can read it without training.
async function opInsights(req, res, pool) {
  const { rows: weekly } = await pool.query(
    `select to_char(date_trunc('week', slot_date), 'YYYY-MM-DD') as week_start, count(*) as n
     from slot_events
     where status = 'booked' and slot_date >= (now() at time zone 'Asia/Kolkata')::date - 56
     group by 1 order by 1 asc`
  );
  const { rows: byFocus } = await pool.query(
    `select focus, count(*) as n
     from slot_events
     where status = 'booked' and focus is not null and focus <> ''
     group by focus order by n desc limit 6`
  );
  const { rows: byDow } = await pool.query(
    `select to_char(slot_date, 'Dy') as dow, count(*) as n
     from slot_events
     where status = 'booked'
     group by 1, extract(dow from slot_date) order by n desc limit 1`
  );
  const { rows: byHour } = await pool.query(
    `select left(slot_time::text, 5) as hour, count(*) as n
     from slot_events
     where status = 'booked'
     group by 1 order by n desc limit 1`
  );
  const { rows: [totals] } = await pool.query(
    `select
       (select count(*) from slot_events where status = 'booked') as total_bookings,
       (select count(*) from slot_events where status = 'booked'
          and slot_date >= (now() at time zone 'Asia/Kolkata')::date - 30) as bookings_this_month`
  );

  const busiestDay = byDow[0]?.dow?.trim() || null;
  const busiestHour = byHour[0]?.hour || null;
  let sentence = "Not enough bookings yet to spot a pattern — check back after a few more calls.";
  if (busiestDay && busiestHour) {
    sentence = `Your busiest day is ${busiestDay}, and ${busiestHour} IST is your most-requested time — consider keeping extra slots open there.`;
  }

  res.status(200).json({
    ok: true,
    sentence,
    totalBookings: Number(totals.total_bookings),
    bookingsThisMonth: Number(totals.bookings_this_month),
    weekly: weekly.map((w) => ({ weekStart: w.week_start, count: Number(w.n) })),
    focusBreakdown: byFocus.map((f) => ({ focus: f.focus, count: Number(f.n) })),
  });
}

const OPS = {
  day: opDay,
  week: opWeek,
  action: opAction,
  clients: opClients,
  faqs: opFaqs,
  gallery: opGallery,
  affiliates: opAffiliates,
  insights: opInsights,
};

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

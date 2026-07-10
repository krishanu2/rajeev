import { getPool, isAdmin } from "../_db.js";

const NAME_MAX = 40;
const REVIEW_MAX = 90;

function looksLikeImage(str) {
  return typeof str === "string" && str.startsWith("data:image/") && str.length < 400000;
}

// Admin gallery manager: GET lists everything; POST takes an action —
// add / delete / move (up|down). Mirrors the FAQ manager so the admin UI
// behaves consistently everywhere.
export default async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const pool = getPool();
  try {
    if (req.method !== "POST") {
      const { rows } = await pool.query(
        "select id, name, review, before_img, after_img from gallery order by sort_order asc, id asc"
      );
      res.status(200).json({ items: rows });
      return;
    }

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
        [name.trim().slice(0, NAME_MAX), review.trim().slice(0, REVIEW_MAX), before || null, after]
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
      const { rows } = await pool.query("select id, sort_order from gallery order by sort_order asc, id asc");
      const idx = rows.findIndex((r) => r.id === id);
      const swapWith = dir === "up" ? idx - 1 : idx + 1;
      if (idx !== -1 && swapWith >= 0 && swapWith < rows.length) {
        const a = rows[idx];
        const b = rows[swapWith];
        const aOrder = a.sort_order === b.sort_order ? swapWith + 1 : b.sort_order;
        const bOrder = a.sort_order === b.sort_order ? idx + 1 : a.sort_order;
        await pool.query("update gallery set sort_order = $2 where id = $1", [a.id, aOrder]);
        await pool.query("update gallery set sort_order = $2 where id = $1", [b.id, bOrder]);
      }
    } else {
      res.status(400).json({ error: "action must be add, delete or move" });
      return;
    }

    const { rows: items } = await pool.query(
      "select id, name, review, before_img, after_img from gallery order by sort_order asc, id asc"
    );
    res.status(200).json({ ok: true, items });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

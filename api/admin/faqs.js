import { getPool, isAdmin } from "../_db.js";

// Admin FAQ manager: GET lists everything; POST takes an action —
// add / update / delete / move (up|down). Kept as one endpoint so the
// admin UI only ever talks to a single URL.
export default async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const pool = getPool();
  try {
    if (req.method !== "POST") {
      const { rows } = await pool.query(
        "select id, question, answer, sort_order from faqs order by sort_order asc, id asc"
      );
      res.status(200).json({ faqs: rows });
      return;
    }

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
      await pool.query("update faqs set question = $2, answer = $3 where id = $1", [
        id,
        question.trim(),
        answer.trim(),
      ]);
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
      // Swap sort_order with the neighbour in the chosen direction.
      const { rows } = await pool.query(
        "select id, sort_order from faqs order by sort_order asc, id asc"
      );
      const idx = rows.findIndex((r) => r.id === id);
      const swapWith = dir === "up" ? idx - 1 : idx + 1;
      if (idx !== -1 && swapWith >= 0 && swapWith < rows.length) {
        const a = rows[idx];
        const b = rows[swapWith];
        // If legacy rows share a sort_order, fall back to index-based values
        // so the swap is always visible.
        const aOrder = a.sort_order === b.sort_order ? swapWith + 1 : b.sort_order;
        const bOrder = a.sort_order === b.sort_order ? idx + 1 : a.sort_order;
        await pool.query("update faqs set sort_order = $2 where id = $1", [a.id, aOrder]);
        await pool.query("update faqs set sort_order = $2 where id = $1", [b.id, bOrder]);
      }
    } else {
      res.status(400).json({ error: "action must be add, update, delete or move" });
      return;
    }

    const { rows: faqs } = await pool.query(
      "select id, question, answer, sort_order from faqs order by sort_order asc, id asc"
    );
    res.status(200).json({ ok: true, faqs });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

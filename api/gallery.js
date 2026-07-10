import { getPool } from "./_db.js";

// Public gallery, in Rajeev's chosen order. Images are stored as compressed
// data URLs in Postgres (small — the admin compresses before upload), so the
// whole gallery is one cacheable response with zero extra infrastructure.
export default async (req, res) => {
  try {
    const { rows } = await getPool().query(
      "select id, name, review, before_img, after_img from gallery order by sort_order asc, id asc"
    );
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    res.status(200).json({
      items: rows.map((r) => ({
        id: r.id,
        name: r.name,
        review: r.review,
        before: r.before_img,
        after: r.after_img,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

import { getPool } from "./_db.js";

// Public list of FAQs, in the order Rajeev arranged them in the admin.
export default async (req, res) => {
  try {
    const { rows } = await getPool().query(
      "select id, question, answer from faqs order by sort_order asc, id asc"
    );
    res.status(200).json({ faqs: rows });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

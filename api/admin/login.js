export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  const { password } = req.body || {};
  if (password && password === process.env.ADMIN_PASSWORD) {
    res.status(200).json({ ok: true });
    return;
  }
  res.status(401).json({ error: "wrong password" });
};

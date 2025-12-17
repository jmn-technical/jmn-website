// pages/api/news/view/[slug].js
import { getPool } from "../../../../utils/db";

export default async function handler(req, res) {
  const {
    query: { slug: slugParam },
    method,
  } = req;

  const pool = getPool();

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ success: false, error: `Method ${method} Not Allowed` });
  }

  try {
    if (!slugParam) {
      return res
        .status(400)
        .json({ success: false, error: "slug required" });
    }

    // Decode slug (Unicode safe)
    const slug = Array.isArray(slugParam)
      ? decodeURIComponent(slugParam[0])
      : decodeURIComponent(slugParam);

    const q = `
      SELECT *
      FROM news
      WHERE slug = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(q, [slug]);

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, error: "Not found" });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("NEWS VIEW GET ERROR:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error" });
  }
}

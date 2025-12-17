// pages/api/images/index.js
import { getPool } from "../../../utils/db";

export default async function handler(req, res) {
  const { method } = req;
  const pool = getPool();

  try {
    switch (method) {
      // GET all images
      case "GET": {
        const result = await pool.query(
          "SELECT * FROM images ORDER BY id DESC"
        );

        return res.status(200).json({
          success: true,
          data: result.rows,
        });
      }

      // POST new image
      case "POST": {
        const { image, imgid } = req.body || {};

        if (!image || !imgid) {
          return res.status(400).json({
            success: false,
            error: "image and imgid are required",
          });
        }

        const insertQuery =
          "INSERT INTO images (image, imgid) VALUES ($1, $2) RETURNING *";

        const result = await pool.query(insertQuery, [image, imgid]);

        return res.status(201).json({
          success: true,
          data: result.rows[0],
        });
      }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`,
        });
    }
  } catch (err) {
    console.error("Images API error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
}

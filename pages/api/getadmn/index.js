import { getPool } from "../../../utils/db";

export default async function handler(req, res) {
  const pool = getPool();

  if (req.method === "POST") {
    try {
      const { name, whatsapp, stream } = req.body;

      // Validate input
      if (!name || !whatsapp || !stream) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: name, whatsapp, or stream",
        });
      }

      // Insert data
      const insertQuery = `
        INSERT INTO admissions (name, whatsapp, stream)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;

      const values = [name, whatsapp, stream];
      const { rows } = await pool.query(insertQuery, values);

      return res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: rows[0],
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  } else if (req.method === "GET") {
    try {
      const query = `
        SELECT * FROM admissions 
        ORDER BY created_at DESC;
      `;
      const { rows } = await pool.query(query);

      return res.status(200).json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("Error fetching admissions:", error);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  } else {
    // Handle other HTTP methods
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`,
    });
  }
}

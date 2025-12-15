// pages/api/auth/index.js
const Auth = require("../../../models/Auth");  // PG adapter

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case "GET": {
        const rows = await Auth.find().exec();
        return res.status(200).json({ success: true, data: rows });
      }

      case "POST": {
        const created = await Auth.create(req.body);
        return res.status(200).json({ success: true, data: created });
      }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error("Auth API error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

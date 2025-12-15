// import Poster from '../../../../models/Poster'
// import dbConnect from  '../../../../utils/dbConnect'
// dbConnect();
 

// dbConnect();

// export default async (req, res) => {
//   const {
//     query: { id },
//     method,
//   } = req;

//   switch (method) {
 
    
//     case "DELETE":
//       try {
//         const delPoster = await Poster.deleteOne({ _id: id });

//         if (!delPoster) {
//           res.status(400).json({ staus: false });
//         }
//         res.status(200).json({ status: true, data: {} });
//       } catch (error) {
//         res.status(400).json({ status: false });
//       }
//   }
// };

// pages/api/images/[id].js
import { getPool } from "../../../../utils/db";

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  const pool = getPool();

  switch (method) {
    case "DELETE": {
      try {
        if (!id) {
          return res.status(400).json({
            success: false,
            error: "id is required",
          });
        }

        const deleteQuery = `
          DELETE FROM images
          WHERE id = $1
          RETURNING id;
        `;

        const { rows } = await pool.query(deleteQuery, [id]);

        if (!rows || rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: "Image not found",
          });
        }

        return res.status(200).json({
          success: true,
          data: { id: rows[0].id },
        });
      } catch (error) {
        console.error("DELETE images error:", error);
        return res.status(500).json({
          success: false,
          error: error.message || "Server error",
        });
      }
    }

    default:
      res.setHeader("Allow", ["DELETE"]);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`,
      });
  }
}

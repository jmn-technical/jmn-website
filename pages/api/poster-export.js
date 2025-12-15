// pages/api/poster-export.js
export default async function handler(req, res) {
  try {
    const type = (req.query.type || "csv").toLowerCase(); // csv | sql

    // Fetch posters from your existing API endpoint
    const base = process.env.NEXT_PUBLIC_PORT ? process.env.NEXT_PUBLIC_PORT : `http://${req.headers.host}`;
    const apiRes = await fetch(`${base}/api/poster`, { headers: { "Content-Type": "application/json" }});
    if (!apiRes.ok) {
      const txt = await apiRes.text();
      return res.status(500).json({ error: "Failed to fetch posters: " + txt });
    }

    const json = await apiRes.json();
    const posters = Array.isArray(json.data) ? json.data : (json || []);

    // Helpers
    const escapeCsv = (val = "") => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      if (/[,"\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const escapeSqlStr = (val) => {
      if (val === null || val === undefined) return "NULL";
      return "'" + String(val).replace(/'/g, "''") + "'";
    };

    // Columns to export — adjust if your schema differs
    const cols = ["_id", "image", "imgId", "timeStamp"];

    if (type === "sql") {
      let sql = `-- Poster SQL Export generated at ${new Date().toISOString()}\n\n`;
      sql += `DELETE FROM \`posters\`;\n\n`; // optional
      for (const r of posters) {
        const vals = cols.map(c => {
          let v = r[c];
          if (v === null || v === undefined) return "NULL";
          if (typeof v === "boolean") return v ? "1" : "0";
          if (typeof v === "object") v = JSON.stringify(v);
          // For timeStamp keep string
          return escapeSqlStr(v);
        });
        sql += `INSERT INTO \`posters\` (\`${cols.join("`,`")}\`) VALUES (${vals.join(", ")});\n`;
      }

      res.setHeader("Content-Type", "application/sql; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="posters-export-${Date.now()}.sql"`);
      return res.status(200).send(sql);
    }

    // CSV default
    let csv = cols.join(",") + "\n";
    for (const r of posters) {
      const row = cols.map(c => {
        let v = r[c];
        if (typeof v === "object" && v !== null) v = JSON.stringify(v);
        return escapeCsv(v);
      }).join(",");
      csv += row + "\n";
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="posters-export-${Date.now()}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error("poster-export error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}

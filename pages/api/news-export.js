// pages/api/news-export.js
export default async function handler(req, res) {
  try {
    const type = (req.query.type || "csv").toLowerCase();

    const base = process.env.NEXT_PUBLIC_PORT ? process.env.NEXT_PUBLIC_PORT : `http://${req.headers.host}`;
    const apiRes = await fetch(`${base}/api/news`, { headers: { "Content-Type": "application/json" }});
    if (!apiRes.ok) {
      const txt = await apiRes.text();
      return res.status(500).json({ error: "Failed to fetch news: " + txt });
    }
    const json = await apiRes.json();
    const news = Array.isArray(json.data) ? json.data : (json || []);

    const escapeCsv = (val = "") => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      if (/[,"\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };

// ...inside your existing file, replace the CSV return section with:

// CSV
const csvCols = ["_id","title","content","image","imgId","isPublished","createdAt","publishedAt"];
let csv = csvCols.join(",") + "\n";
for (const r of news) {
  const row = csvCols.map(c => {
    let v = r[c];
    if (typeof v === "object" && v !== null) v = JSON.stringify(v);
    return escapeCsv(v);
  }).join(",");
  csv += row + "\n";
}

// Prepend UTF-8 BOM so Excel recognizes UTF-8
const csvWithBom = "\uFEFF" + csv;

res.setHeader("Content-Type", "text/csv; charset=utf-8");
res.setHeader("Content-Disposition", `attachment; filename="news-export-${Date.now()}.csv"`);
return res.status(200).send(csvWithBom);

  } catch (err) {
    console.error("Export error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}

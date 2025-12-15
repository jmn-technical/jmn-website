// restore-news-from-csv.js
require("dotenv").config();
const fs = require("fs");
const parse = require("csv-parse/sync");
const { MongoClient, ObjectId } = require("mongodb");

(async () => {
const csvFile = "D:/work/jamia-madee/news-export-1764738759665.csv";
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(process.env.DB_NAME || "test");
  const col = db.collection("news");

  console.log("Reading CSV...");
  const raw = fs.readFileSync(csvFile, "utf8");
  const rows = parse.parse(raw, { columns: true });

  console.log(`Loaded ${rows.length} rows from backup CSV`);
  let updated = 0;

  for (const row of rows) {
    const id = row._id?.trim();
    if (!id) continue;

    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const update = {
      $set: {
        image: row.image,
        imgId: row.imgId || "",
      },
    };

    const res = await col.updateOne(query, update);

    if (res.modifiedCount > 0) {
      console.log(`✔ Restored ${id}`);
      updated++;
    }
  }

  console.log(`\n🎉 DONE — Restored ${updated} documents.`);
  await client.close();
})();

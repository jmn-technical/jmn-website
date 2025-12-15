/**
 * Apply Cloudinary mapping to MongoDB news collection.
 * Matches by:
 *   1. doc_id (best)
 *   2. old_url exact match
 *   3. fallback text search
 */

import fs from "fs";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const PREVIEW = process.env.PREVIEW_ONLY === "true";
const CSV_FILE = process.env.CSV_IN || "cloudinary-migration-mapping-news.csv";
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION = "news";

if (!MONGODB_URI || !DB_NAME) {
  console.error("❌ Missing MONGODB_URI or DB_NAME in .env");
  process.exit(1);
}

console.log(`Connected to ${DB_NAME}.${COLLECTION}`);
console.log(`Preview mode: ${PREVIEW}`);
console.log(`Reading mapping: ${CSV_FILE}`);

const csvData = parse(fs.readFileSync(CSV_FILE), {
  columns: true,
  skip_empty_lines: true,
});

let audit = [];

const client = new MongoClient(MONGODB_URI);

async function run() {
  await client.connect();
  const db = client.db(DB_NAME);
  const col = db.collection(COLLECTION);

  for (let row of csvData) {
    const { doc_id, old_url, new_url, public_id } = row;

    let matchDoc = null;
    let matchMethod = "none";

    // 1️⃣ Match by doc_id
    if (doc_id && doc_id.length > 5) {
      matchDoc = await col.findOne({ _id: doc_id });
      if (matchDoc) matchMethod = "doc_id_exact";
    }

    // 2️⃣ Match by old_url exact
    if (!matchDoc && old_url) {
      matchDoc = await col.findOne({ image: old_url });
      if (matchDoc) matchMethod = "image_exact";
    }

    // 3️⃣ Match by partial old_url
    if (!matchDoc && old_url) {
      matchDoc = await col.findOne({ image: { $regex: old_url.split("/").pop() } });
      if (matchDoc) matchMethod = "image_partial";
    }

    // No match → skip
    if (!matchDoc) {
      audit.push({
        public_id,
        doc_id,
        mapped_doc_id: "",
        match_method: "no_match",
        updated: "no",
        old_url,
        new_url,
      });
      continue;
    }

    // Apply update
    if (!PREVIEW) {
      await col.updateOne(
        { _id: matchDoc._id },
        {
          $set: {
            image: new_url,
            imgId: public_id,
          },
        }
      );
    }

    audit.push({
      public_id,
      doc_id,
      mapped_doc_id: matchDoc._id,
      match_method: matchMethod,
      updated: PREVIEW ? "preview" : "yes",
      old_url,
      new_url,
    });
  }

  const outCSV = "mapping-apply-robust-results.csv";
  fs.writeFileSync(outCSV, audit
    .map(r => Object.values(r).join(","))
    .join("\n")
  );

  console.log(`Done. Output: ${outCSV}`);
  await client.close();
}

run();

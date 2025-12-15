// update-news-from-mapping.js
require("dotenv").config();
const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "test";
const COLLECTION = "news";

// use PREVIEW_ONLY=true to just log, false to actually write
const PREVIEW_ONLY = process.env.PREVIEW_ONLY === "true";

const CSV_PATH =
  process.env.CSV_IN ||
  path.join(__dirname, "cloudinary-migration-mapping-news.csv");

// simple CSV line parser (no commas inside fields in this file)
function parseLine(line) {
  // split by comma and trim quotes/spaces
  return line.split(",").map((part) =>
    part.trim().replace(/^"/, "").replace(/"$/, "")
  );
}

async function main() {
  console.log(`Using CSV: ${CSV_PATH}`);
  console.log(`PREVIEW_ONLY = ${PREVIEW_ONLY}`);
  console.log(`Connecting to ${DB_NAME}.${COLLECTION}...`);

  // 1) read mapping CSV
  const csvRaw = fs.readFileSync(CSV_PATH, "utf8");
  const lines = csvRaw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (!lines.length) {
    console.error("CSV appears empty.");
    process.exit(1);
  }

  // header
  const header = lines[0];
  if (!header.toLowerCase().startsWith("public_id")) {
    console.warn("⚠️ First row does not look like header, continuing anyway...");
  }

  const byOldUrl = new Map();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const [public_id, old_url, new_url] = parseLine(line);

    if (!old_url || !new_url) continue;

    // only care about old cloud name
    if (!old_url.includes("res.cloudinary.com/dc52qrj3q")) continue;

    byOldUrl.set(old_url, { public_id, new_url });
  }

  console.log(
    `Loaded ${byOldUrl.size} mapping entries with old Cloudinary URLs.`
  );

  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in .env");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  try {
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);

    let totalMatched = 0;
    let totalUpdated = 0;

    for (const [old_url, { public_id, new_url }] of byOldUrl.entries()) {
      const query = { image: old_url };

      if (PREVIEW_ONLY) {
        const docs = await col
          .find(query)
          .project({ _id: 1, image: 1, imgId: 1 })
          .toArray();

        if (docs.length) {
          totalMatched += docs.length;
          docs.forEach((doc) => {
            console.log(
              `\n[PREVIEW] would update doc ${doc._id}:\n` +
                `  image: ${doc.image}\n` +
                `   -->  ${new_url}\n` +
                `  imgId: ${doc.imgId} => ${public_id}`
            );
          });
        }
      } else {
        const res = await col.updateMany(query, {
          $set: { image: new_url, imgId: public_id },
        });

        if (res.matchedCount) {
          totalMatched += res.matchedCount;
          totalUpdated += res.modifiedCount;
          console.log(
            `[APPLY] old_url matched ${res.matchedCount}, modified ${res.modifiedCount}`
          );
        }
      }
    }

    console.log("\nDone.");
    console.log(`Total docs matched: ${totalMatched}`);
    if (!PREVIEW_ONLY) {
      console.log(`Total docs updated: ${totalUpdated}`);
    } else {
      console.log(
        "This was a PREVIEW. Set PREVIEW_ONLY=false to actually apply changes."
      );
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

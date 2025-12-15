// apply-mapping-to-mongo.js
// Usage: set envs in .env or pass via PowerShell before running.
// Requires: npm i mongodb dotenv csv-parse

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const { parse } = require('csv-parse/sync');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'test';
const COLLECTION = process.env.COLLECTION || 'news';
const CSV_IN = path.join(__dirname, process.env.CSV_IN || 'cloudinary-migration-mapping-news.csv');
const CSV_OUT = path.join(__dirname, process.env.CSV_OUT || 'mapping-apply-results.csv');
const PREVIEW_ONLY = String(process.env.PREVIEW_ONLY || 'true').toLowerCase() === 'true';
const REPLACE_IN_CONTENT = String(process.env.REPLACE_IN_CONTENT || 'true').toLowerCase() === 'true';

if (!MONGODB_URI) { console.error('MONGODB_URI missing in env'); process.exit(1); }
if (!fs.existsSync(CSV_IN)) { console.error('CSV mapping not found at', CSV_IN); process.exit(1); }

const csvRaw = fs.readFileSync(CSV_IN, 'utf8');
const rows = parse(csvRaw, { columns: true, skip_empty_lines: true });

(async () => {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const coll = db.collection(COLLECTION);

  // CSV output header
  fs.writeFileSync(CSV_OUT, 'public_id,doc_id,old_url,new_url,updated,notes\n', 'utf8');

  // iterate mapping rows for collection 'news' (case-ins)
  const toProcess = rows.filter(r => String(r.collection || '').toLowerCase() === 'news');

  console.log(`Found ${toProcess.length} mapping rows for collection 'news'. PREVIEW_ONLY=${PREVIEW_ONLY}`);

  for (const r of toProcess) {
    const public_id = r.public_id || '';
    const doc_id = r.doc_id || ''; // CSV has doc_id field (looks like hex ObjectId)
    const old_url = r.old_url || '';
    const new_url = r.new_url || '';

    if (!doc_id) {
      fs.appendFileSync(CSV_OUT, `${public_id},,${old_url},${new_url},no,missing_doc_id\n`);
      continue;
    }

    // try to parse doc_id as ObjectId; if fails we'll search by string equality too
    let queryById = null;
    try {
      queryById = { _id: new ObjectId(doc_id) };
    } catch (e) {
      queryById = null;
    }

    let doc = null;
    if (queryById) doc = await coll.findOne(queryById);
    if (!doc) {
      // fallback: try to find by string id stored as 'id' or 'doc_id' or by matching old_url in image field
      doc = await coll.findOne({
        $or: [
          { _id: doc_id }, // if stored as string id
          { id: doc_id },
          { image: old_url },
          { image: { $regex: (old_url.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')) } },
        ]
      });
    }

    if (!doc) {
      fs.appendFileSync(CSV_OUT, `${public_id},${doc_id},${old_url},${new_url},no,doc_not_found\n`);
      console.log(`WARN: doc not found for mapping doc_id=${doc_id} public_id=${public_id}`);
      continue;
    }

    // prepare update: set image field exactly to CSV new_url
    const updateOps = { image: new_url };

    // optionally replace old_url occurrences in content field
    let contentReplaced = false;
    if (REPLACE_IN_CONTENT && doc.content && typeof doc.content === 'string' && doc.content.includes(old_url)) {
      updateOps.content = doc.content.split(old_url).join(new_url);
      contentReplaced = true;
    }

    if (PREVIEW_ONLY) {
      fs.appendFileSync(CSV_OUT, `${public_id},${doc._id},${old_url},${new_url},preview,fields:${Object.keys(updateOps).join('|')}\n`);
      console.log(`[PREVIEW] would update doc ${doc._id} -> image,${contentReplaced ? 'content':''}`);
    } else {
      try {
        const res = await coll.updateOne({ _id: doc._id }, { $set: updateOps });
        const ok = res.modifiedCount > 0 ? 'yes' : 'no';
        fs.appendFileSync(CSV_OUT, `${public_id},${doc._id},${old_url},${new_url},${ok},fields:${Object.keys(updateOps).join('|')}\n`);
        console.log(`Updated ${doc._id} -> image set to new_url (${ok})`);
      } catch (err) {
        fs.appendFileSync(CSV_OUT, `${public_id},${doc._id},${old_url},${new_url},error,${(err.message||'').replace(/[\r\n,]/g,' ')}\n`);
        console.error('Update error for', doc._id, err.message || err);
      }
    }
  }

  console.log('Done. Audit CSV:', CSV_OUT);
  await client.close();
  if (PREVIEW_ONLY) console.log('PREVIEW_ONLY=true — no writes. Set PREVIEW_ONLY=false and re-run to apply.');
  process.exit(0);
})();

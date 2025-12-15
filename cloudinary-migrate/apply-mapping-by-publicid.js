// apply-mapping-by-publicid.js
// Reads cloudinary-migration-mapping-news.csv (public_id,old_url,new_url,...)
// Finds news docs by public_id (imgId match, image contains public_id or filename)
// Sets image = new_url (and optionally replace old_url inside content)
//
// Usage: set envs in .env or via PowerShell before running.
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

if (!MONGODB_URI) { console.error('MONGODB_URI missing'); process.exit(1); }
if (!fs.existsSync(CSV_IN)) { console.error('CSV mapping not found at', CSV_IN); process.exit(1); }

const csvRaw = fs.readFileSync(CSV_IN, 'utf8');
const rows = parse(csvRaw, { columns: true, skip_empty_lines: true });

(async () => {
  const client = new MongoClient(MONGODB_URI, { maxPoolSize: 10 });
  await client.connect();
  const db = client.db(DB_NAME);
  const coll = db.collection(COLLECTION);

  fs.writeFileSync(CSV_OUT, 'public_id,matched_doc_id,match_method,old_url,new_url,updated,notes\n', 'utf8');

  // Filter rows that have new_url
  const toProcess = rows.filter(r => (r.new_url && r.new_url.trim() !== ''));

  console.log(`Processing ${toProcess.length} mapping rows. PREVIEW_ONLY=${PREVIEW_ONLY}`);

  for (const r of toProcess) {
    const public_id = (r.public_id || '').trim();
    const old_url = (r.old_url || '').trim();
    const new_url = (r.new_url || '').trim();

    if (!public_id) {
      fs.appendFileSync(CSV_OUT, `, ,no_match,${old_url},${new_url},no,missing_public_id\n`);
      continue;
    }

    const filename = public_id.includes('/') ? public_id.split('/').pop() : public_id;
    const alt_public_id = public_id.startsWith('jmn/') ? public_id.replace(/^jmn\//, '') : public_id;

    // Try matching methods in order
    let doc = null;
    let method = '';

    // 1) imgId exact match
    doc = await coll.findOne({ imgId: public_id }) || await coll.findOne({ imgId: alt_public_id });
    if (doc) method = 'imgId_exact';

    // 2) image contains public_id
    if (!doc) {
      doc = await coll.findOne({ image: { $regex: public_id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') } });
      if (doc) method = 'image_contains_public_id';
    }

    // 3) image contains filename
    if (!doc && filename) {
      doc = await coll.findOne({ image: { $regex: filename.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') } });
      if (doc) method = 'image_contains_filename';
    }

    // 4) fallback: content contains public_id (might be in HTML)
    if (!doc) {
      doc = await coll.findOne({ content: { $regex: public_id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') } });
      if (doc) method = 'content_contains_public_id';
    }

    if (!doc) {
      fs.appendFileSync(CSV_OUT, `${public_id},,no_match,${old_url},${new_url},no,doc_not_found\n`);
      console.log(`NO MATCH for ${public_id}`);
      continue;
    }

    // Prepare update object
    const updateOps = { image: new_url };
    let contentReplaced = false;
    if (REPLACE_IN_CONTENT && doc.content && typeof doc.content === 'string' && old_url && doc.content.includes(old_url)) {
      updateOps.content = doc.content.split(old_url).join(new_url);
      contentReplaced = true;
    }

    if (PREVIEW_ONLY) {
      fs.appendFileSync(CSV_OUT, `${public_id},${doc._id},${method},${old_url},${new_url},preview,fields:${Object.keys(updateOps).join('|')}\n`);
      console.log(`[PREVIEW] ${public_id} -> doc ${doc._id} (${method})`);
    } else {
      try {
        const res = await coll.updateOne({ _id: doc._id }, { $set: updateOps });
        const ok = res.modifiedCount > 0 ? 'yes' : 'no';
        fs.appendFileSync(CSV_OUT, `${public_id},${doc._id},${method},${old_url},${new_url},${ok},fields:${Object.keys(updateOps).join('|')}\n`);
        console.log(`UPDATED ${public_id} -> doc ${doc._id} (${ok})`);
      } catch (err) {
        fs.appendFileSync(CSV_OUT, `${public_id},${doc._id},${method},${old_url},${new_url},error,${(err.message||'').replace(/[\r\n,]/g,' ')}\n`);
        console.error('Update error', public_id, err.message || err);
      }
    }
  }

  console.log('Done. Audit CSV:', CSV_OUT);
  await client.close();
  if (PREVIEW_ONLY) console.log('PREVIEW_ONLY=true — no writes. Set PREVIEW_ONLY=false to apply.');
  process.exit(0);
})();

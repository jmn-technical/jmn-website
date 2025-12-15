// deep-replace-news-mongo.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || null; // e.g. 'test'
const COLLECTION = process.env.COLLECTION || 'news';
const OLD_HOST = process.env.OLD_HOST || 'res.cloudinary.com/dc52qrj3q';
const NEW_HOST = process.env.NEW_HOST || 'res.cloudinary.com/delltphln';
const PREVIEW_ONLY = String(process.env.PREVIEW_ONLY || 'true').toLowerCase() === 'true';
const CSV_OUT = path.join(__dirname, process.env.CSV_OUT || 'mongo-news-deep-replace.csv');

// small helper to escape regex
const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

if (!MONGODB_URI) { console.error('MONGODB_URI not set in .env'); process.exit(1); }

function deepReplaceInValue(v) {
  if (typeof v === 'string') {
    let s = v;
    if (s.includes(OLD_HOST)) s = s.split(OLD_HOST).join(NEW_HOST);
    // normalize accidental duplicate folder e.g. /jmn/jmn/ -> /jmn/
    if (s.includes('/jmn/jmn/')) s = s.split('/jmn/jmn/').join('/jmn/');
    return s;
  } else if (Array.isArray(v)) {
    return v.map(item => deepReplaceInValue(item));
  } else if (v && typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) out[k] = deepReplaceInValue(v[k]);
    return out;
  }
  return v;
}

(async () => {
  const client = new MongoClient(MONGODB_URI, { maxPoolSize: 10 });
  await client.connect();

  const targetDb = DB_NAME || (new URL(MONGODB_URI).pathname.replace('/','') || null);
  if (!targetDb) {
    console.error('Cannot determine DB name. Set DB_NAME in .env or include DB in the URI.');
    await client.close(); process.exit(1);
  }
  const db = client.db(targetDb);
  const coll = db.collection(COLLECTION);

  console.log(`Connected to ${targetDb}.${COLLECTION}`);
  console.log(`Preview mode: ${PREVIEW_ONLY}`);
  console.log(`Replacing ${OLD_HOST} -> ${NEW_HOST}`);
  console.log(`Also normalizing '/jmn/jmn/' -> '/jmn/'`);

  // CSV header
  fs.writeFileSync(CSV_OUT, 'doc_id,fields_changed,notes\n', 'utf8');

  // Build a regex for quick candidate selection (search strings containing OLD_HOST OR '/jmn/jmn/')
  const hostRegex = new RegExp(escapeRegex(OLD_HOST));
  const dupRegex = /\/jmn\/jmn\//;

  // Query tries common fields first, then falls back to a safe scan of the collection in batches.
  const query = {
    $or: [
      { image: { $regex: hostRegex } },
      { content: { $regex: hostRegex } },
      { imgId: { $regex: hostRegex } },
      { images: { $elemMatch: { $regex: hostRegex } } },
      { image: { $regex: dupRegex } },
      { content: { $regex: dupRegex } },
      // fallback is expensive; keep commented if collection huge. Uncomment if you want to be exhaustive.
      { $where: function() { return JSON.stringify(this).indexOf(OLD_HOST) >= 0 || this && JSON.stringify(this).indexOf('/jmn/jmn/') >= 0; } }
    ]
  };

  // Use cursor to iterate safely
  const cursor = coll.find(query).batchSize(100);
  let processed = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    processed++;
    const replacedDoc = deepReplaceInValue(doc);

    // compute minimal top-level patch
    const patch = {};
    const changedFields = [];
    for (const key of Object.keys(replacedDoc)) {
      if (key === '_id') continue;
      const before = JSON.stringify(doc[key]);
      const after = JSON.stringify(replacedDoc[key]);
      if (before !== after) {
        patch[key] = replacedDoc[key];
        changedFields.push(key);
      }
    }

    if (changedFields.length === 0) {
      fs.appendFileSync(CSV_OUT, `${doc._id},"",no_change\n`);
      continue;
    }

    if (PREVIEW_ONLY) {
      console.log(`[PREVIEW] would update doc ${doc._id} fields: ${changedFields.join(',')}`);
      fs.appendFileSync(CSV_OUT, `${doc._id},"${changedFields.join('|')}",preview\n`);
    } else {
      try {
        const res = await coll.updateOne({ _id: doc._id }, { $set: patch });
        const ok = res.modifiedCount > 0 ? 'yes' : 'no';
        console.log(`Updated doc ${doc._id} -> ${ok}, fields: ${changedFields.join(',')}`);
        fs.appendFileSync(CSV_OUT, `${doc._id},"${changedFields.join('|')}",${ok}\n`);
      } catch (err) {
        console.error('Update failed for', doc._id, err.message || err);
        fs.appendFileSync(CSV_OUT, `${doc._id},"${changedFields.join('|')}",error:${(err.message||'').replace(/[\r\n,]/g,' ')}\n`);
      }
    }
  }

  console.log(`Done. Processed candidates: ${processed}`);
  console.log('Audit CSV:', CSV_OUT);
  await client.close();
  if (PREVIEW_ONLY) console.log('PREVIEW_ONLY=true — no writes. Set PREVIEW_ONLY=false to apply.');
  process.exit(0);
})();

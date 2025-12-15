/*
  restore-from-mapping.js
  Zero-deps CSV parser + Mongo restore script.
  Usage:
    $env:CSV_IN="cloudinary-migration-mapping-news.csv"
    $env:PREVIEW_ONLY="true"   # preview (no writes)
    node restore-from-mapping.js
*/
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const CSV_FILE = process.env.CSV_IN || 'cloudinary-migration-mapping-news.csv';
const PREVIEW = (process.env.PREVIEW_ONLY === 'true') || false;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'test';
const COLLECTION = 'news';
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}
const csvPath = path.resolve(process.cwd(), CSV_FILE);
if (!fs.existsSync(csvPath)) {
  console.error('CSV not found:', csvPath);
  process.exit(1);
}
function parseCSVText(text) {
  const rows = [];
  let i = 0, cur = '', row = [], inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i+1] === '"') { cur += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      } else { cur += ch; i++; continue; }
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { row.push(cur); cur = ''; i++; continue; }
      if (ch === '\r') { i++; continue; }
      if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; i++; continue; }
      cur += ch; i++;
    }
  }
  if (cur !== '' || row.length) row.push(cur);
  if (row.length) rows.push(row);
  return rows;
}
function csvToObjects(text) {
  const rows = parseCSVText(text);
  if (!rows.length) return [];
  const headers = rows[0].map(h => String(h || '').trim());
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 1 && (row[0] === '' || row[0] === null || row[0] === undefined)) continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c] === undefined ? '' : row[c];
    }
    out.push(obj);
  }
  return out;
}
let raw;
try {
  raw = fs.readFileSync(csvPath, 'utf8');
} catch (e) {
  console.error('Failed to read CSV:', e.message);
  process.exit(1);
}
const rows = csvToObjects(raw);
if (!rows.length) {
  console.error('No rows parsed from CSV.');
  process.exit(1);
}
(async () => {
  console.log(`Loaded mapping rows: ${rows.length}`);
  console.log(`Connecting to DB: ${DB_NAME} ...`);
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  await client.connect();
  const db = client.db(DB_NAME);
  const col = db.collection(COLLECTION);
  const audit = [];
  let processed = 0, updated = 0, notFound = 0;
  for (const r of rows) {
    processed++;
    const public_id = (r.public_id || r.publicId || r.publicID || r.publicid || '').toString().trim();
    const doc_id = (r.doc_id || r.docId || r._id || r.docid || '').toString().trim();
    const old_url = (r.old_url || r.oldUrl || r.old || r.oldurl || '').toString().trim();
    const new_url = (r.new_url || r.newUrl || r.new || r.newurl || '').toString().trim();
    if (!doc_id) {
      audit.push({ doc_id: '', public_id, old_url, new_url, status: 'missing_doc_id' });
      continue;
    }
    let query;
    try {
      query = { _id: new ObjectId(doc_id) };
    } catch (e) {
      query = { _id: doc_id };
    }
    const found = await col.findOne(query, { projection: { image: 1, imgId: 1 } });
    if (!found) {
      notFound++;
      audit.push({ doc_id, public_id, old_url, new_url, status: 'doc_not_found' });
      continue;
    }
    if (PREVIEW) {
      audit.push({
        doc_id, public_id, old_url, new_url,
        status: 'preview',
        before_image: found.image || '',
        before_imgId: found.imgId || ''
      });
      continue;
    }
    const update = {
      $set: {
        image: old_url || new_url || '',
        imgId: public_id || ''
      }
    };
    const res = await col.updateOne(query, update);
    if (res.matchedCount === 0) {
      audit.push({ doc_id, public_id, old_url, new_url, status: 'no_match_on_update' });
    } else {
      updated++;
      audit.push({
        doc_id, public_id, old_url, new_url, status: 'updated',
        matchedCount: res.matchedCount, modifiedCount: res.modifiedCount
      });
    }
  }
  const outPath = path.resolve(process.cwd(), 'restore-from-mapping-results.csv');
  const headers = ['doc_id','public_id','old_url','new_url','status','before_image','before_imgId','matchedCount','modifiedCount'];
  const csvLines = [headers.join(',')];
  for (const a of audit) {
    const line = headers.map(h => {
      const v = a[h] === undefined ? '' : String(a[h]).replace(/"/g, '""');
      return `"${v}"`;
    }).join(',');
    csvLines.push(line);
  }
  fs.writeFileSync(outPath, csvLines.join('\n'), 'utf8');
  console.log(`Processed: ${processed}, updated: ${updated}, notFound: ${notFound}`);
  console.log(`Audit CSV: ${outPath}`);
  await client.close();
  process.exit(0);
})();

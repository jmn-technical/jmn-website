// restore-from-mapping.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse/lib/sync');
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

const raw = fs.readFileSync(csvPath, 'utf8');
const rows = csvParse(raw, { columns: true, skip_empty_lines: true });

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
    const public_id = (r.public_id || r.publicId || r.publicID || '').toString();
    const doc_id = (r.doc_id || r.docId || r._id || '').toString();
    const old_url = (r.old_url || r.oldUrl || r.old || '').toString();
    const new_url = (r.new_url || r.newUrl || r.new || '').toString();

    if (!doc_id) {
      audit.push({ doc_id: '', public_id, old_url, new_url, status: 'missing_doc_id' });
      continue;
    }

    let query;
    try {
      query = { _id: new ObjectId(doc_id) };
    } catch (e) {
      // not an ObjectId — use raw string
      query = { _id: doc_id };
    }

    const found = await col.findOne(query, { projection: { image: 1, imgId: 1 } });

    if (!found) {
      notFound++;
      audit.push({ doc_id, public_id, old_url, new_url, status: 'doc_not_found' });
      continue;
    }

    // If PREVIEW: don't write, but show what would be set
    if (PREVIEW) {
      audit.push({
        doc_id, public_id, old_url, new_url,
        status: 'preview',
        before_image: found.image || '',
        before_imgId: found.imgId || ''
      });
      continue;
    }

    // Apply update: restore original image & imgId
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
  // write CSV header then rows
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

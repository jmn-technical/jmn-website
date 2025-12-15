// migrate-cloudinary.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

/**
 * IMPORTANT: ensure .env contains OLD_* and NEW_* keys as described in README
 */

const OLD = {
  cloud_name: process.env.OLD_CLOUD_NAME,
  api_key: process.env.OLD_API_KEY,
  api_secret: process.env.OLD_API_SECRET,
};

const NEW = {
  cloud_name: process.env.NEW_CLOUD_NAME,
  api_key: process.env.NEW_API_KEY,
  api_secret: process.env.NEW_API_SECRET,
};

console.log('ENV debug:', {
  OLD_CLOUD_NAME: OLD.cloud_name ? 'present' : 'missing',
  NEW_CLOUD_NAME: NEW.cloud_name ? 'present' : 'missing',
});

if (!OLD.cloud_name || !NEW.cloud_name) {
  console.error('Missing env variables. Please set OLD_* and NEW_* credentials in .env');
  process.exit(1);
}

// configure cloudinary instance at runtime by calling configureCloudinary()
function configureCloudinary({ cloud_name, api_key, api_secret }) {
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });
}

const CSV_FILE = path.resolve(__dirname, 'cloudinary-migration-mapping.csv');
const csvWriter = createCsvWriter({
  path: CSV_FILE,
  header: [
    { id: 'public_id', title: 'public_id' },
    { id: 'old_url', title: 'old_url' },
    { id: 'new_url', title: 'new_url' },
    { id: 'status', title: 'status' },
    { id: 'error', title: 'error' },
  ],
  append: false,
});

// options
const MAX_RESULTS_PER_PAGE = 500; // Cloudinary supports up to 500
const CONCURRENCY = Number(process.env.CONCURRENCY || 6); // number of concurrent uploads to new account
const RETRY_LIMIT = 2;
const TEST_COUNT = Number(process.env.TEST_COUNT || 0); // set >0 to test only first N resources

async function listOldResources(next_cursor = null, collected = []) {
  configureCloudinary(OLD);
  const opts = { max_results: MAX_RESULTS_PER_PAGE, type: 'upload' };
  if (next_cursor) opts.next_cursor = next_cursor;

  const res = await cloudinary.api.resources(opts);
  if (!res.resources || !Array.isArray(res.resources)) return collected;
  collected.push(...res.resources);

  if (res.next_cursor) {
    return listOldResources(res.next_cursor, collected);
  }
  return collected;
}

async function migrateOne(resource) {
  const publicId = resource.public_id;
  const oldUrl = resource.secure_url;
  const folder = resource.folder || '';
  const resourceType = resource.resource_type || 'image';

  configureCloudinary(NEW);

  const uploadOptions = {
    public_id: publicId,
    folder: folder,
    resource_type: resourceType === 'video' ? 'video' : 'image',
    use_filename: false,
    unique_filename: false,
    overwrite: false,
  };

  let attempt = 0;
  while (attempt <= RETRY_LIMIT) {
    try {
      const uploadResult = await cloudinary.uploader.upload(oldUrl, uploadOptions);
      const newUrl = uploadResult.secure_url;
      return { public_id: publicId, old_url: oldUrl, new_url: newUrl, status: 'ok', error: '' };
    } catch (err) {
      attempt++;
      console.error(`Upload failed for ${publicId} (attempt ${attempt}):`, (err && err.message) || err);
      if (attempt > RETRY_LIMIT) {
        return {
          public_id: publicId,
          old_url: oldUrl,
          new_url: '',
          status: 'failed',
          error: (err && err.message) || String(err),
        };
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

/**
 * asyncPool: runs iteratorFn(items[i]) with a maximum of poolLimit concurrent promises.
 * returns Promise<Array<results>>
 */
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);

    // When the number of executing promises reaches the limit, wait for any to finish
    const e = p.then(() => executing.splice(executing.indexOf(e), 1));
    executing.push(e);
    if (executing.length >= poolLimit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(ret);
}

(async () => {
  try {
    console.log('Listing resources from old Cloudinary account...');
    configureCloudinary(OLD);
    let resources = await listOldResources();
    console.log(`Found ${resources.length} resources in old account.`);

    if (TEST_COUNT > 0) {
      resources = resources.slice(0, TEST_COUNT);
      console.log(`Running in test mode: only migrating first ${resources.length} items.`);
    }

    // create/overwrite CSV with header
    await csvWriter.writeRecords([]);

    const results = [];

    // use asyncPool for concurrency
    await asyncPool(CONCURRENCY, resources, async (res) => {
      const r = await migrateOne(res);
      results.push(r);
      // append each result to CSV directly (escaping quotes)
      const row = `${r.public_id},"${(r.old_url || '').replace(/"/g, '""')}","${(r.new_url || '').replace(/"/g, '""')}",${r.status},"${(r.error || '').replace(/"/g, '""')}"\n`;
      fs.appendFileSync(CSV_FILE, row);
      console.log(`${r.status.toUpperCase()} - ${r.public_id}`);
      return r;
    });

    console.log('Migration completed. Mapping CSV:', CSV_FILE);
    const ok = results.filter((x) => x.status === 'ok').length;
    const failed = results.filter((x) => x.status === 'failed').length;
    console.log(`  Success: ${ok}`);
    console.log(`  Failed: ${failed}`);
    if (failed > 0) {
      console.log('Check CSV for failed items and re-run for those specific public_ids.');
    }
    console.log('Next step: update your database URLs (see instructions).');

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();

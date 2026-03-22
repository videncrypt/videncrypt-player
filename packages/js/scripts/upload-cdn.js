/**
 * upload-cdn.js
 *
 * Uploads the built SDK to Cloudflare R2 after a release.
 * Files are served from sdk.videncrypt.com (public R2 bucket).
 *
 * Serves two paths:
 *   /ve.js              → https://sdk.videncrypt.com/ve.js           (latest)
 *   /v{version}/ve.js   → https://sdk.videncrypt.com/v0.1.0/ve.js   (pinned)
 *
 * Usage:
 *   node scripts/upload-cdn.js
 *
 * Required env vars:
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET       
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync }               from 'fs';
import { resolve, dirname }           from 'path';
import { fileURLToPath }              from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = resolve(__dirname, '..');

// ── Read version ───────────────────────────────────────────
const pkg     = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const version = pkg.version;

// ── Read built file ────────────────────────────────────────
const filePath = resolve(root, 'dist', 've.js');
let fileContent;
try {
  fileContent = readFileSync(filePath);
} catch {
  console.error('❌  dist/ve.js not found — run `pnpm build` first.');
  process.exit(1);
}

// ── R2 client ──────────────────────────────────────────────
const client = new S3Client({
  region:   'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

const BUCKET = process.env.R2_BUCKET;

async function upload(key, body, cacheControl) {
  await client.send(new PutObjectCommand({
    Bucket:       BUCKET,
    Key:          key,
    Body:         body,
    ContentType:  'application/javascript; charset=utf-8',
    CacheControl: cacheControl,
  }));
}

async function run() {
  console.log(`\n📦  @videncrypt/js v${version} — CDN upload\n`);

  // Pinned version — immutable, cache forever
  // https://sdk.videncrypt.com/v0.1.0/ve.js
  await upload(
    `v${version}/ve.js`,
    fileContent,
    'public, max-age=31536000, immutable',
  );

  // Latest — revalidates every hour
  // https://sdk.videncrypt.com/ve.js
  await upload(
    've.js',
    fileContent,
    'public, max-age=3600, stale-while-revalidate=86400',
  );

  console.log(`
✅  Done. Available at:

    Latest:  https://sdk.videncrypt.com/ve.js
    Pinned:  https://sdk.videncrypt.com/v${version}/ve.js
`);
}

run().catch((err) => {
  console.error('❌  Upload failed:', err.message);
  process.exit(1);
});
#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

const DEFAULT_DIST = 'dist';

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) main();

function main() {
  const { values } = parseArgs({
    options: {
      bucket: { type: 'string', short: 'b' },
      dist: { type: 'string', short: 'd' },
      endpoint: { type: 'string', short: 'e' },
      region: { type: 'string', short: 'r' },
      'cloudfront-id': { type: 'string' },
      'prune-assets': { type: 'boolean' },
      'dry-run': { type: 'boolean' },
      help: { type: 'boolean' },
    },
  });

  if (values.help) {
    console.log(`Usage: node scripts/deploy.mjs [options]

Ships \`dist/\` to an S3-compatible bucket via the AWS CLI, then optionally
invalidates a CloudFront distribution.

Hashed files under assets/ are cached for a year (immutable). Everything else -
HTML, robots.txt, sitemap.xml, the favicon, service workers - revalidates on
every request. Old assets are kept so tabs still running the previous release
can lazy-load their chunks; pass --prune-assets to delete them.

Options:
  -b, --bucket <name>       Bucket name (env: DEPLOY_BUCKET)
  -d, --dist <path>         Dist directory (default: dist)
  -e, --endpoint <url>      S3-compatible endpoint (env: DEPLOY_ENDPOINT)
                            Use for Cloudflare R2, DigitalOcean Spaces, MinIO
  -r, --region <name>       Region (env: AWS_REGION)
      --cloudfront-id <id>  CloudFront distribution to invalidate
                            (env: DEPLOY_CLOUDFRONT_ID)
      --prune-assets        Also delete assets/ files that aren't in this build
      --dry-run             Print the aws commands without running them

Requires the AWS CLI (\`aws\` on PATH) and credentials configured via the
standard chain (env vars, ~/.aws/credentials, IAM role, etc.).`);
    process.exit(0);
  }

  const bucket = values.bucket ?? process.env.DEPLOY_BUCKET;
  const distDir = resolve(process.cwd(), values.dist ?? DEFAULT_DIST);
  const endpoint = values.endpoint ?? process.env.DEPLOY_ENDPOINT;
  const region = values.region ?? process.env.AWS_REGION;
  const cloudfrontId = values['cloudfront-id'] ?? process.env.DEPLOY_CLOUDFRONT_ID;
  const pruneAssets = values['prune-assets'] === true;
  const dryRun = values['dry-run'] === true;

  if (!bucket) fail('bucket is required (--bucket or DEPLOY_BUCKET)');
  if (!existsSync(distDir)) fail(`dist directory not found: ${distDir} (run \`pnpm build\` first)`);
  if (!dryRun && !hasAwsCli()) {
    fail('aws CLI not found on PATH - install from https://aws.amazon.com/cli/');
  }

  const target = [];
  if (endpoint) target.push('--endpoint-url', endpoint);
  if (region) target.push('--region', region);

  // Only Vite's content-hashed output is safe to cache forever. Uploaded first
  // so the new HTML never references an asset that isn't there yet.
  const assetsArgs = [
    's3',
    'sync',
    join(distDir, 'assets'),
    `s3://${bucket}/assets`,
    ...target,
    '--cache-control',
    'public,max-age=31536000,immutable',
  ];
  if (pruneAssets) assetsArgs.push('--delete');

  // Everything else revalidates: HTML at every depth, page data, robots.txt,
  // sitemap.xml, favicon, service workers. --delete removes pages that no
  // longer exist; the exclude keeps it away from assets/.
  const entryArgs = [
    's3',
    'sync',
    distDir,
    `s3://${bucket}`,
    ...target,
    '--delete',
    '--exclude',
    'assets/*',
    '--exclude',
    '.vite/*',
    '--cache-control',
    'public,max-age=0,must-revalidate',
  ];

  if (existsSync(join(distDir, 'assets'))) awsRun(assetsArgs, dryRun);
  awsRun(entryArgs, dryRun);

  if (cloudfrontId) {
    awsRun(
      ['cloudfront', 'create-invalidation', '--distribution-id', cloudfrontId, '--paths', '/*'],
      dryRun,
    );
  }

  console.log(`deploy: complete → s3://${bucket}${endpoint ? ` (${endpoint})` : ''}`);
}

function awsRun(args, dryRun) {
  const cmd = ['aws', ...args].join(' ');
  console.log(`> ${cmd}`);
  if (dryRun) return;
  const res = spawnSync('aws', args, { stdio: 'inherit' });
  if (res.status !== 0) fail(`aws exited with ${res.status}`);
}

function hasAwsCli() {
  const res = spawnSync('aws', ['--version'], { stdio: 'ignore' });
  return res.status === 0;
}

function fail(msg) {
  console.error(`deploy: ${msg}`);
  process.exit(1);
}

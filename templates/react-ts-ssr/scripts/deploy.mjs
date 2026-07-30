#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

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
      'dry-run': { type: 'boolean' },
      help: { type: 'boolean' },
    },
  });

  if (values.help) {
    console.log(`Usage: node scripts/deploy.mjs [options]

Ships \`dist/\` to an S3-compatible bucket via the AWS CLI, then optionally
invalidates a CloudFront distribution.

Options:
  -b, --bucket <name>       Bucket name (env: DEPLOY_BUCKET)
  -d, --dist <path>         Dist directory (default: dist)
  -e, --endpoint <url>      S3-compatible endpoint (env: DEPLOY_ENDPOINT)
                            Use for Cloudflare R2, DigitalOcean Spaces, MinIO
  -r, --region <name>       Region (env: AWS_REGION)
      --cloudfront-id <id>  CloudFront distribution to invalidate
                            (env: DEPLOY_CLOUDFRONT_ID)
      --dry-run             Print the aws commands without running them

Requires the AWS CLI (\`aws\` on PATH) and credentials configured via the
standard chain (env vars, ~/.aws/credentials, IAM role, etc.).`);
    process.exit(0);
  }

  const bucket = values.bucket ?? process.env.DEPLOY_BUCKET;
  const distDir = resolve(process.cwd(), values.dist ?? 'dist');
  const endpoint = values.endpoint ?? process.env.DEPLOY_ENDPOINT;
  const region = values.region ?? process.env.AWS_REGION;
  const cloudfrontId = values['cloudfront-id'] ?? process.env.DEPLOY_CLOUDFRONT_ID;
  const dryRun = values['dry-run'] === true;

  if (!bucket) fail('bucket is required (--bucket or DEPLOY_BUCKET)');
  if (!existsSync(distDir)) fail(`dist directory not found: ${distDir} (run \`pnpm build\` first)`);
  if (!dryRun && !hasAwsCli()) {
    fail('aws CLI not found on PATH - install from https://aws.amazon.com/cli/');
  }

  const syncArgs = ['s3', 'sync', distDir, `s3://${bucket}`, '--delete'];
  if (endpoint) syncArgs.push('--endpoint-url', endpoint);
  if (region) syncArgs.push('--region', region);
  syncArgs.push(
    '--cache-control',
    'public,max-age=31536000,immutable',
    '--exclude',
    'index.html',
    '--exclude',
    'sw.js',
    '--exclude',
    'manifest.webmanifest',
    '--exclude',
    'robots.txt',
    '--exclude',
    'sitemap.xml',
  );

  const htmlArgs = [
    's3',
    'sync',
    distDir,
    `s3://${bucket}`,
    '--exclude',
    '*',
    '--include',
    'index.html',
    '--include',
    'sw.js',
    '--include',
    'manifest.webmanifest',
    '--include',
    'robots.txt',
    '--include',
    'sitemap.xml',
  ];
  if (endpoint) htmlArgs.push('--endpoint-url', endpoint);
  if (region) htmlArgs.push('--region', region);
  htmlArgs.push('--cache-control', 'public,max-age=0,must-revalidate');

  awsRun(syncArgs, dryRun);
  awsRun(htmlArgs, dryRun);

  if (cloudfrontId) {
    const invalidateArgs = [
      'cloudfront',
      'create-invalidation',
      '--distribution-id',
      cloudfrontId,
      '--paths',
      '/index.html',
      '/sw.js',
      '/manifest.webmanifest',
      '/robots.txt',
      '/sitemap.xml',
    ];
    awsRun(invalidateArgs, dryRun);
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

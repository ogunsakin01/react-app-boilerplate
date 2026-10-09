import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const SCRIPT = join(process.cwd(), 'scripts', 'deploy.mjs');
const DIST = 'dist';

function run(cwd: string, args: string[], extraEnv: Record<string, string> = {}) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      DEPLOY_BUCKET: '',
      DEPLOY_ENDPOINT: '',
      DEPLOY_CLOUDFRONT_ID: '',
      ...extraEnv,
    },
  });
}

describe('scripts/deploy.mjs', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'deploy-test-'));
    mkdirSync(join(tmp, DIST, 'assets'), { recursive: true });
    writeFileSync(join(tmp, DIST, 'index.html'), '<!doctype html>');
    writeFileSync(join(tmp, DIST, 'assets', 'index-abc123.js'), '// app');
  });

  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it('--help exits 0 and prints usage', () => {
    const res = run(tmp, ['--help']);
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/Usage:/);
    expect(res.stdout).toMatch(/DEPLOY_BUCKET/);
  });

  it('fails when the bucket is not provided', () => {
    const res = run(tmp, ['--dry-run']);
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/bucket is required/);
  });

  it('fails when the dist directory does not exist', () => {
    rmSync(join(tmp, DIST), { recursive: true });
    const res = run(tmp, ['--bucket', 'my-bucket', '--dry-run']);
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/dist directory not found/);
  });

  it('caches only assets/ as immutable and revalidates everything else', () => {
    const res = run(tmp, ['--bucket', 'my-bucket', '--dry-run']);
    expect(res.status).toBe(0);
    const [assets, entries] = res.stdout
      .split('\n')
      .filter((line) => line.startsWith('> aws s3 sync'));
    expect(assets).toMatch(
      /assets s3:\/\/my-bucket\/assets .*--cache-control public,max-age=31536000,immutable/,
    );
    expect(entries).toMatch(
      / s3:\/\/my-bucket --delete --exclude assets\/\* .*--cache-control public,max-age=0,must-revalidate/,
    );
    expect(res.stdout).toMatch(/deploy: complete/);
  });

  it('keeps old assets unless --prune-assets is passed', () => {
    const keep = run(tmp, ['--bucket', 'my-bucket', '--dry-run']);
    expect(keep.stdout).not.toMatch(/s3:\/\/my-bucket\/assets [^\n]*--delete/);

    const prune = run(tmp, ['--bucket', 'my-bucket', '--prune-assets', '--dry-run']);
    expect(prune.stdout).toMatch(/s3:\/\/my-bucket\/assets [^\n]*--delete/);
  });

  it(`deploys ${DIST}/ by default`, () => {
    const res = run(tmp, ['--bucket', 'my-bucket', '--dry-run']);
    expect(res.stdout).toContain(`${join(tmp, DIST)} s3://my-bucket --delete`);
  });

  it('includes --endpoint-url when an endpoint is provided (R2/Spaces/MinIO)', () => {
    const res = run(tmp, [
      '--bucket',
      'my-bucket',
      '--endpoint',
      'https://accountid.r2.cloudflarestorage.com',
      '--dry-run',
    ]);
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/--endpoint-url https:\/\/accountid\.r2\.cloudflarestorage\.com/);
  });

  it('emits a CloudFront invalidation when --cloudfront-id is set', () => {
    const res = run(tmp, ['--bucket', 'my-bucket', '--cloudfront-id', 'E1234567890', '--dry-run']);
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/aws cloudfront create-invalidation --distribution-id E1234567890/);
    expect(res.stdout).toMatch(/--paths \/\*/);
  });

  it('honors env-var fallbacks (DEPLOY_BUCKET, DEPLOY_ENDPOINT)', () => {
    const res = run(tmp, ['--dry-run'], {
      DEPLOY_BUCKET: 'env-bucket',
      DEPLOY_ENDPOINT: 'https://env.example.com',
    });
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/s3:\/\/env-bucket/);
    expect(res.stdout).toMatch(/--endpoint-url https:\/\/env\.example\.com/);
  });
});

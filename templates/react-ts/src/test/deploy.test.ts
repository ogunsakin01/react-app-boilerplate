import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const SCRIPT = join(process.cwd(), 'scripts', 'deploy.mjs');

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
    mkdirSync(join(tmp, 'dist'));
    writeFileSync(join(tmp, 'dist', 'index.html'), '<!doctype html>');
    writeFileSync(join(tmp, 'dist', 'sw.js'), '// sw');
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
    rmSync(join(tmp, 'dist'), { recursive: true });
    const res = run(tmp, ['--bucket', 'my-bucket', '--dry-run']);
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/dist directory not found/);
  });

  it('prints the aws sync commands in dry-run mode without invoking aws', () => {
    const res = run(tmp, ['--bucket', 'my-bucket', '--dry-run']);
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/aws s3 sync .* s3:\/\/my-bucket --delete/);
    expect(res.stdout).toMatch(/--cache-control public,max-age=31536000,immutable/);
    expect(res.stdout).toMatch(/--exclude index\.html/);
    expect(res.stdout).toMatch(/--include index\.html/);
    expect(res.stdout).toMatch(/deploy: complete/);
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
    expect(res.stdout).toMatch(/--paths \/index\.html \/sw\.js/);
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

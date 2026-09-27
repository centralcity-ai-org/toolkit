// Offline checks for the MCP bridge configuration and the quickstart options.
// They need no Central City server and make no network calls.
import assert from 'node:assert/strict';
import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { configSchema, loadConfig } from '../mcp/bridge.js';
import { formatResult, parseOptions } from '../examples/quickstart/index.mjs';

const TOKEN = 'a'.repeat(40);
const UUID_V4 = '00000000-0000-4000-8000-000000000000';

test('bridge configuration accepts only a plain-HTTP loopback base URL and a bounded token', () => {
  for (const baseUrl of [
    'https://centralcity.ai',
    'http://example.com',
    'http://example.com:4310',
    'ftp://example.com',
    'not a url',
  ])
    assert.equal(configSchema.safeParse({ baseUrl, token: TOKEN }).success, false, baseUrl);
  assert.equal(
    configSchema.safeParse({ baseUrl: 'https://centralcity.ai', token: 'short' }).success,
    false,
  );
});

test('bridge configuration must be an absolute path to a private regular file', async () => {
  await assert.rejects(loadConfig('relative/config.json'), /absolute/);
  const dir = await mkdtemp(join(tmpdir(), 'cc-bridge-'));
  try {
    const path = join(dir, 'config.json');
    await writeFile(path, JSON.stringify({ baseUrl: 'https://centralcity.ai', token: TOKEN }));
    if (process.platform !== 'win32') {
      await chmod(path, 0o644);
      await assert.rejects(loadConfig(path), /private regular file/);
      await chmod(path, 0o600);
    }
    // A private file with a non-loopback base URL is still refused by the schema.
    await assert.rejects(loadConfig(path));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('quickstart options require HTTPS (or loopback HTTP) and a UUID v4 key', () => {
  const options = parseOptions(['--origin', 'https://centralcity.ai', '--idempotency-key', UUID_V4]);
  assert.deepEqual(options, { origin: 'https://centralcity.ai', idempotencyKey: UUID_V4 });
  for (const args of [
    ['--origin', 'http://centralcity.ai'],
    ['--origin', 'https://user:pass@example.com'],
    ['--origin', 'https://centralcity.ai/path'],
    ['--origin', 'https://centralcity.ai', '--idempotency-key', 'not-a-uuid'],
    ['--origin', 'https://centralcity.ai', '--origin', 'https://centralcity.ai'],
    ['--unknown', 'x'],
  ])
    assert.throws(() => parseOptions(args), Error, args.join(' '));
});

test('quickstart output names the claim link as private and never prints raw responses', () => {
  const text = formatResult({
    agentId: 'agent_1',
    claimUrl: 'https://centralcity.ai/#claim=ccclaim_placeholder',
    replayed: false,
    expiry: 'No automatic time expiry.',
  });
  assert.match(text, /Created unclaimed extractor agent: agent_1/);
  assert.match(text, /Keep the claim link private/);
  const replay = formatResult({ agentId: 'agent_1', claimUrl: null, replayed: true, expiry: '' });
  assert.match(replay, /Existing unclaimed extractor agent/);
  assert.doesNotMatch(replay, /ccclaim_/);
});

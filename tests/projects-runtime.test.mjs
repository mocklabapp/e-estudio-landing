// @ts-check
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { fixture } from './helpers/build-fixture.mjs';

const owner = '12345678-1234-4234-8234-123456789abc';
const privateDetail = 'runtime-fixture-private-detail';
/** @param {number} version */
const publicFields = (version) => ({
  images: [{ url: `https://abcdefghijklmnopqrst.supabase.co/storage/v1/object/public/projects-images/house-${version}.jpg` }],
  category: 'Residential', year: String(2024 + version),
});
const names = ['MOCKLAB_PROJECTS_URL', 'MOCKLAB_USER_ID', 'GALIA_PROJECTS_URL', 'GALIA_USER_ID', 'SUPABASE_URL',
  'SUPABASE_SECRET_KEY', 'SUPABASE_ANON_KEY', 'PUBLIC_PROJECTS_ROLE_JWT'];
/** @param {import('node:http').Server} server */
const listen = async (server) => {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  return `http://127.0.0.1:${address.port}`;
};

test('built Vercel public HTTP endpoint reflects changed upstream without rebuilding', async () => {
  // Never inspect or forward the host's portfolio configuration into a fixture build.
  for (const name of names) delete process.env[name];
  const build = await fixture();
  assert.equal(build.status, 0, build.output);
  let version = 1;
  let upstreamCalls = 0;
  const nativeFetch = globalThis.fetch;
  const upstream = createServer((req, res) => {
    upstreamCalls++;
    const url = new URL(req.url ?? '/', 'http://fixture.test');
    assert.equal(url.pathname, '/functions/v1/public-projects');
    assert.deepEqual([...url.searchParams], [['uid', owner]]);
    assert.equal(req.method, 'GET');
    assert.equal(req.headers.apikey, undefined);
    assert.equal(req.headers.authorization, undefined);
    if (version === 3) { res.writeHead(403); res.end(privateDetail); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    // Different states are deliberately irrelevant to the public mapping.
    res.end(JSON.stringify({ projects: ['draft', 'published'].map((state, i) => ({
      id: String(i + 1), title: `${state} v${version}`, description: null,
      weblink: null, state, prompt: privateDetail, originalLanguage: null, translations: [],
      ...publicFields(version),
    })) }));
  });
  /** @type {import('node:http').Server | undefined} */
  let server;
  try {
    const upstreamURL = await listen(upstream);
    globalThis.fetch = (input, options) => {
      const url = new URL(input instanceof Request ? input.url : input);
      assert.equal(url.hostname, 'abcdefghijklmnopqrst.supabase.co');
      assert.equal(options?.cache, 'no-store');
      assert.equal(options?.redirect, 'error');
      return nativeFetch(`${upstreamURL}${url.pathname}${url.search}`, options);
    };
    // Only public configuration is supplied, and only after the isolated build.
    process.env.MOCKLAB_PROJECTS_URL = 'https://abcdefghijklmnopqrst.supabase.co/functions/v1/public-projects';
    process.env.MOCKLAB_USER_ID = owner;
    const module = await import(pathToFileURL(join(build.root, '.vercel/output/_functions/entry.mjs')).href);
    /** @type {unknown} */
    const handler = module.default;
    assert.ok(handler && typeof handler === 'object' && 'fetch' in handler);
    server = createServer(async (req, res) => {
      try {
        if (typeof handler.fetch !== 'function') throw new Error('Missing fetch handler');
        /** @type {unknown} */
        const result = await handler.fetch(new Request(`http://site.test${req.url}`));
        assert.ok(result instanceof Response);
        res.writeHead(result.status, Object.fromEntries(result.headers));
        res.end(Buffer.from(await result.arrayBuffer()));
      } catch { res.writeHead(500); res.end('Fixture handler failed'); }
    });
    const site = await listen(server);
    for (version = 1; version <= 3; version++) {
      const result = await nativeFetch(`${site}/api/projects.json?uid=foreign&MOCKLAB_PROJECTS_URL=https://evil.test`);
      assert.equal(result.status, version === 3 ? 503 : 200);
      for (const header of ['cache-control', 'cdn-cache-control', 'vercel-cdn-cache-control']) {
        assert.equal(result.headers.get(header), 'no-store');
      }
      const body = await result.text();
      assert.ok(!body.includes(privateDetail));
      assert.deepEqual(JSON.parse(body), version === 3 ? { error: 'Projects unavailable' } : {
        projects: ['draft', 'published'].map((state, i) => ({ id: String(i + 1),
          title: `${state} v${version}`, description: null, weblink: null,
          originalLanguage: null, translations: [], ...publicFields(version) })),
      });
    }
    assert.equal(upstreamCalls, 3);
    delete process.env.MOCKLAB_PROJECTS_URL;
    const unconfigured = await nativeFetch(`${site}/api/projects.json`);
    assert.equal(unconfigured.status, 503);
    assert.equal(upstreamCalls, 3);
    assert.equal(unconfigured.headers.get('cache-control'), 'no-store');
    const config = await readFile(join(build.root, '.vercel/output/config.json'), 'utf8');
    assert.ok(config.includes('_render'));
    assert.ok(!config.includes('isr'));
    /** @param {string} directory @returns {Promise<void>} */
    const scan = async (directory) => {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const file = join(directory, entry.name);
        if (entry.isDirectory()) await scan(file);
        else assert.ok(!(await readFile(file)).includes(Buffer.from(privateDetail)));
      }
    };
    await scan(join(build.root, 'dist/client'));
  } finally {
    globalThis.fetch = nativeFetch;
    for (const name of names) delete process.env[name];
    const siteServer = server;
    if (siteServer) { siteServer.closeAllConnections(); await new Promise((resolve) => siteServer.close(resolve)); }
    upstream.closeAllConnections();
    await new Promise((resolve) => upstream.close(resolve));
  }
});

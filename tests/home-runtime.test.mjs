// @ts-check
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { fixture } from './helpers/build-fixture.mjs';

const owner = '12345678-1234-4234-8234-123456789abc';
const origin = 'https://abcdefghijklmnopqrst.supabase.co';
const ids = ['2', '10', '9007199254740992', '9007199254740993', '9223372036854775807'];
const noStore = ['cache-control', 'cdn-cache-control', 'vercel-cdn-cache-control'];

/** @param {string} html */
const cardIds = (html) => [...html.matchAll(/<article\b[\s\S]*?href="\/proyectos\/(\d+)\/"/g)]
  .map(([, id]) => id);

/**
 * @param {number} version
 * @returns {Array<import('../src/lib/projects.ts').PublicProject & { state: string; prompt: string }>}
 */
const records = (version) => ids.map((id, index) => ({
  id, title: `Proyecto ${id} v${version}`, description: null,
  originalLanguage: null, translations: [], weblink: 'javascript:private-detail',
  images: [{ url: `${origin}/storage/v1/object/public/projects-images/${id}-v${version}.jpg` }],
  category: index === 4 ? 'residencial' : null, year: index === 4 ? '2026' : null,
  state: ['draft', 'published', 'archived', 'draft', 'published'][index],
  prompt: 'private-detail',
}));

test('Home HTTP selects latest bigint IDs, refreshes without rebuilding and preserves the API', async (t) => {
  delete process.env.MOCKLAB_PROJECTS_URL;
  delete process.env.MOCKLAB_USER_ID;
  const build = await fixture(({ replace }) =>
    replace('src/i18n/locales.ts', "= ['es', 'ca'];", "= ['es', 'en'];"));
  assert.equal(build.status, 0, build.output);
  const module = await import(pathToFileURL(join(build.root, '.vercel/output/_functions/entry.mjs')).href);
  /** @type {unknown} */
  const handler = module.default;
  assert.ok(handler && typeof handler === 'object' && 'fetch' in handler);
  const nativeFetch = globalThis.fetch;
  let version = 1;
  let calls = 0;
  let rows = records(version);
  // Serve only known static fixtures; dynamic requests go through the built handler.
  const staticPaths = new Map([['/', 'index.html'], ['/en/', 'en/index.html'],
    ['/estudio/', 'estudio/index.html']]);
  const server = createServer(async (req, res) => {
    try {
      const path = new URL(req.url ?? '/', 'http://fixture.test').pathname;
      const file = staticPaths.get(path);
      if (file) {
        try {
          const html = await readFile(join(build.root, 'dist/client', file));
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
          return;
        } catch (error) {
          if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
        }
      }
      if (typeof handler.fetch !== 'function') throw new Error('Missing handler');
      /** @type {unknown} */
      const response = await handler.fetch(new Request(`https://example.test${req.url}`));
      assert.ok(response instanceof Response);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
    } catch {
      res.writeHead(500);
      res.end('Fixture request failed');
    }
  });
  try {
    process.env.MOCKLAB_PROJECTS_URL = `${origin}/functions/v1/public-projects`;
    process.env.MOCKLAB_USER_ID = owner;
    globalThis.fetch = async (input, options) => {
      const url = new URL(input instanceof Request ? input.url : input);
      calls++;
      assert.equal(url.origin + url.pathname, `${origin}/functions/v1/public-projects`);
      assert.deepEqual([...url.searchParams], [['uid', owner]]);
      assert.equal(options?.cache, 'no-store');
      assert.equal(options?.redirect, 'error');
      if (version === 3) return new Response('private-detail', { status: 500 });
      return Response.json({ projects: rows });
    };
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const site = `http://127.0.0.1:${address.port}`;
    /** @param {string} [path] */
    const home = async (path = '/') => {
      const response = await nativeFetch(site + path);
      return { response, html: await response.text() };
    };
    const first = await home('/?uid=foreign');
    assert.equal(first.response.status, 200);
    assert.deepEqual(cardIds(first.html), ids.slice(-3).reverse());
    for (const name of noStore) assert.equal(first.response.headers.get(name), 'no-store');
    for (const id of ids.slice(-3)) {
      assert.ok(first.html.includes(`src="${origin}/storage/v1/object/public/projects-images/${id}-v1.jpg"`));
      assert.ok(first.html.includes(`Proyecto ${id} v1`));
    }
    assert.match(first.html, /Residencial/);
    assert.match(first.html, /2026/);
    assert.doesNotMatch(first.html, /private-detail|javascript:|Casa Aneto|Sant Vicenç|Acacias/);
    await assert.rejects(readFile(join(build.root, 'dist/client/index.html')), { code: 'ENOENT' });
    await t.test('API retains every project in ascending order', async () => {
      const response = await nativeFetch(`${site}/api/projects.json`);
      assert.equal(response.status, 200);
      const body = await response.text();
      const positions = ids.map((id) => body.indexOf(`"id":"${id}"`));
      assert.ok(positions.every((position) => position >= 0));
      assert.deepEqual([...positions].sort((a, b) => a - b), positions);
      assert.doesNotMatch(body, /"state"|"prompt"/);
      assert.match(body, /"category":"residencial"/);
      assert.doesNotMatch(body, /"category":"Residencial"/);
    });
    version = 2;
    rows = records(version);
    const refreshed = await home();
    assert.deepEqual(cardIds(refreshed.html), ids.slice(-3).reverse());
    assert.match(refreshed.html, /v2\.jpg/);
    assert.doesNotMatch(refreshed.html, /v1\.jpg/);
    assert.equal(calls, 3, 'Each Home/API request must fetch once');
    await t.test('optional locale and Spanish sibling remain static without a fetch', async () => {
      for (const path of ['/en/', '/estudio/']) {
        const result = await home(path);
        assert.equal(result.response.status, 200);
        assert.equal(result.response.headers.get('cache-control'), null);
        assert.doesNotMatch(result.html, /Proyecto 9223372036854775807/);
        if (path === '/en/') {
          assert.match(result.html, /<html lang="en" dir="ltr">/);
          assert.match(result.html, /Language navigation/);
          assert.match(result.html, /A clear starting point/);
        } else assert.match(result.html, /<title>Estudio \| e estudio<\/title>/);
      }
      assert.equal(calls, 3);
      assert.match(first.html, /hreflang="en" href="https:\/\/example.test\/en\/"/);
    });
    await t.test('Home omits unknown categories without losing years or leaking empty metadata', async () => {
      for (const category of ['unknown-category', null, undefined]) {
        for (const year of ['2026', null]) {
          rows = [{ ...records(2)[4], category, year }];
          const result = await home();
          assert.equal(result.response.status, 200);
          const card = result.html.match(/<article\b[\s\S]*?<\/article>/)?.[0];
          assert.ok(card);
          assert.doesNotMatch(card, /unknown-category|Categoría/);
          if (year) assert.match(card, /<dd>2026<\/dd>/);
          else assert.doesNotMatch(card, /<dl\b|2026/);
        }
      }
    });
    await t.test('missing media and language use truthful existing pilot fallbacks', async () => {
      rows = [{ ...records(2)[4], title: 'Do not fall back', originalLanguage: 'en', images: [] }];
      const result = await home();
      assert.deepEqual(cardIds(result.html), [ids[4]]);
      assert.match(result.html, /Do not fall back/);
      assert.match(result.html, /Imagen pendiente/);
      assert.doesNotMatch(result.html, /Contenido en español pendiente/);
      const card = result.html.match(/<article\b[\s\S]*?<\/article>/)?.[0];
      assert.ok(card);
      assert.doesNotMatch(card, /Barcelona|Ubicación/);
    });
    rows = [];
    const empty = await home();
    assert.equal(empty.response.status, 200);
    assert.match(empty.html, /Todavía no hay proyectos disponibles/);
    assert.match(empty.html, /href="\/proyectos\/"/);
    assert.deepEqual(cardIds(empty.html), []);
    version = 3;
    const failure = await home();
    assert.equal(failure.response.status, 503);
    assert.match(failure.html, /No podemos mostrar los proyectos/);
    assert.match(failure.html, /href="\/proyectos\/"/);
    assert.doesNotMatch(failure.html, /private-detail/);
    delete process.env.MOCKLAB_PROJECTS_URL;
    const unconfigured = await home();
    assert.equal(unconfigured.response.status, 503);
    for (const result of [refreshed, empty, failure, unconfigured]) {
      for (const name of noStore) assert.equal(result.response.headers.get(name), 'no-store');
    }
  } finally {
    globalThis.fetch = nativeFetch;
    delete process.env.MOCKLAB_PROJECTS_URL;
    delete process.env.MOCKLAB_USER_ID;
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});

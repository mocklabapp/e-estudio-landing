// @ts-check
import assert from 'node:assert/strict';
import test from 'node:test';
import { configuration, reads } from './helpers/projects-loader.mjs';

const { getProjects } = await import('../src/lib/projects.ts');
const { GET } = await import('../src/pages/api/projects.json.ts');
const owner = '12345678-1234-4234-8234-123456789abc';
const endpoint = 'https://abcdefghijklmnopqrst.supabase.co/functions/v1/public-projects';
const defaults = { images: [], category: null, year: null };
/** @param {string} [id] */
const row = (id = '9007199254740993') => ({ id, title: 'Public',
  description: null, weblink: null, originalLanguage: null, translations: [] });
/** @param {unknown[]} projects */
const response = (projects) => Response.json({ projects });
/** Invoke the public route with visitor input, without fabricating Astro internals.
 * @param {string} [query]
 */
async function request(query = '') {
  /** @type {unknown} */
  const result = await Reflect.apply(GET, undefined, [{
    request: new Request(`https://site.test/api/projects.json${query}`),
  }]);
  assert.ok(result instanceof Response);
  return result;
}
const originalFetch = globalThis.fetch;
test.beforeEach(() => {
  for (const name of Object.keys(configuration)) delete configuration[name];
  configuration.MOCKLAB_PROJECTS_URL = endpoint;
  configuration.MOCKLAB_USER_ID = owner;
  reads.length = 0;
});
test.afterEach(() => { globalThis.fetch = originalFetch; });

test('getProjects reads only MOCKLAB public URL and UID for a credential-free GET and preserves the DTO', async () => {
  globalThis.fetch = async (input, options) => {
    const url = new URL(input instanceof Request ? input.url : input);
    assert.equal(url.href, `${endpoint}?uid=${owner}`);
    assert.equal(options?.method, 'GET');
    assert.equal(options?.redirect, 'error');
    assert.equal(options?.cache, 'no-store');
    assert.ok(options?.signal instanceof AbortSignal);
    assert.deepEqual([...new Headers(options?.headers)], []);
    assert.equal(options?.body, undefined);
    return response([{ ...row(), state: 'draft', prompt: 'PRIVATE', originalLanguage: 'ca',
      translations: [{ language: 'en', title: null, description: 'Partial', prompt: 'PRIVATE' }] },
    { ...row('9223372036854775807'), state: 'published', nas_folder: 'PRIVATE' }]);
  };
  const result = await getProjects();
  assert.deepEqual(result, [{ ...row(), ...defaults, originalLanguage: 'ca',
    translations: [{ language: 'en', title: null, description: 'Partial' }] },
  { ...row('9223372036854775807'), ...defaults }]);
  assert.deepEqual(reads, ['MOCKLAB_PROJECTS_URL', 'MOCKLAB_USER_ID']);
});

test('getProjects and the public API preserve images, category and year', async () => {
  const url = 'https://abcdefghijklmnopqrst.supabase.co/storage/v1/object/public/user-media/house.jpg';
  const value = { ...row(), images: [{ url }], category: 'Residential', year: '2026' };
  globalThis.fetch = async () => response([{ ...value, images: [{ url, prompt: 'PRIVATE' }] }]);
  const result = await request('?uid=foreign');
  assert.equal(result.status, 200);
  for (const name of ['cache-control', 'cdn-cache-control', 'vercel-cdn-cache-control']) {
    assert.equal(result.headers.get(name), 'no-store');
  }
  assert.deepEqual(await result.json(), { projects: [value] });
  assert.deepEqual(await getProjects(), [value]);
});

test('runtime URL and owner are read again per call, without a secret fallback', async () => {
  let calls = 0;
  globalThis.fetch = async (input) => {
    const url = new URL(input instanceof Request ? input.url : input);
    assert.equal(url.origin + url.pathname, configuration.MOCKLAB_PROJECTS_URL);
    assert.equal(url.searchParams.get('uid'), configuration.MOCKLAB_USER_ID?.toLowerCase());
    calls++;
    return response([]);
  };
  assert.deepEqual(await getProjects(), []);
  configuration.MOCKLAB_PROJECTS_URL = endpoint.replace('abcdefghijklmnopqrst', 'tsrqponmlkjihgfedcba');
  configuration.MOCKLAB_USER_ID = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA';
  assert.deepEqual(await getProjects(), []);
  delete configuration.MOCKLAB_PROJECTS_URL;
  configuration.SUPABASE_URL = 'https://abcdefghijklmnopqrst.supabase.co';
  configuration.SUPABASE_SECRET_KEY = 'fixture-obsolete-key';
  await assert.rejects(getProjects(), { message: 'Projects unavailable' });
  assert.equal(calls, 2);
  assert.deepEqual(reads, Array(3).fill(['MOCKLAB_PROJECTS_URL', 'MOCKLAB_USER_ID']).flat());
});

test('old GALIA variables alone cannot configure getProjects', async () => {
  delete configuration.MOCKLAB_PROJECTS_URL;
  delete configuration.MOCKLAB_USER_ID;
  configuration.GALIA_PROJECTS_URL = endpoint;
  configuration.GALIA_USER_ID = owner;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return response([]); };
  await assert.rejects(getProjects(), { message: 'Projects unavailable' });
  assert.equal(calls, 0);
  assert.deepEqual(reads, ['MOCKLAB_PROJECTS_URL', 'MOCKLAB_USER_ID']);
});

test('invalid public configuration fails before fetching', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('PRIVATE'); };
  for (const url of [undefined, 'https://evil.test', `${endpoint}?uid=other`, `${endpoint}/`]) {
    configuration.MOCKLAB_PROJECTS_URL = url;
    await assert.rejects(getProjects(), { message: 'Projects unavailable' });
  }
  configuration.MOCKLAB_PROJECTS_URL = endpoint;
  configuration.MOCKLAB_USER_ID = 'invalid';
  await assert.rejects(getProjects(), { message: 'Projects unavailable' });
  assert.equal(calls, 0);
});

test('public endpoint ignores visitor overrides and fetches fresh data with no-store', async () => {
  let calls = 0;
  globalThis.fetch = async (input) => {
    assert.equal(String(input), `${endpoint}?uid=${owner}`);
    return response([{ ...row(), title: `Version ${++calls}` }]);
  };
  for (let i = 1; i <= 2; i++) {
    const res = await request('?uid=other&user=other&MOCKLAB_PROJECTS_URL=https://evil.test&key=evil');
    assert.equal(res.status, 200);
    for (const header of ['cache-control', 'cdn-cache-control', 'vercel-cdn-cache-control']) {
      assert.equal(res.headers.get(header), 'no-store');
    }
    assert.deepEqual(await res.json(), { projects: [{ ...row(), ...defaults, title: `Version ${i}` }] });
  }
});

test('errors and malformed public data fail closed without upstream details', async () => {
  for (const upstream of [
    async () => { throw new Error('PRIVATE'); },
    async () => new Response('PRIVATE', { status: 403 }),
    async () => new Response('', { status: 302, headers: { location: 'https://evil.test' } }),
    async () => response([{ ...row(), id: 9007199254740992 }]),
    async () => response([{ ...row(), title: {} }]),
    async () => response([{ ...row(), translations: {} }]),
    async () => response([{ ...row(), images: null }]),
    async () => response([{ ...row(), images: [{ url: 'https://evil.test/private.jpg' }] }]),
    async () => response([{ ...row(), category: {} }]),
    async () => response([{ ...row(), year: 2026 }]),
    async () => new Response('{broken'),
    async () => Response.json([]),
  ]) {
    globalThis.fetch = upstream;
    const res = await request();
    assert.equal(res.status, 503);
    for (const header of ['cache-control', 'cdn-cache-control', 'vercel-cdn-cache-control']) {
      assert.equal(res.headers.get(header), 'no-store');
    }
    assert.deepEqual(await res.json(), { error: 'Projects unavailable' });
  }
  delete configuration.MOCKLAB_USER_ID;
  assert.equal((await request()).status, 503);
});

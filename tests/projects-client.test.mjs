// @ts-check
/// <reference types="node" />
import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchPublicProjects } from '../src/lib/projects-client.ts';

const endpoint = 'https://abcdefghijklmnopqrst.supabase.co/functions/v1/public-projects';
const uid = '12345678-1234-4234-8234-123456789abc';
const defaults = { images: [], category: null, year: null };
/** @param {string} [id] */
const project = (id = '9007199254740993') => ({ id, title: 'Public', description: null,
  weblink: null, originalLanguage: null, translations: [] });
/** @param {unknown} body */
const response = (body) => Response.json(body);
/** @param {() => Promise<unknown>} action */
async function unavailable(action) {
  await assert.rejects(action, (error) => {
    assert.ok(error instanceof Error);
    assert.equal(error.message, 'Projects unavailable');
    assert.equal(error.cause, undefined);
    return true;
  });
}

test('one public GET fixes UID, strips private fields and preserves all states and partial content', async () => {
  let calls = 0;
  let deadlines = 0;
  const signal = new AbortController().signal;
  const result = await fetchPublicProjects(endpoint, uid.toUpperCase(), {
    timeout: (milliseconds) => { deadlines++; assert.equal(milliseconds, 10_000); return signal; },
    fetch: async (input, options) => {
      calls++;
      const url = new URL(input instanceof Request ? input.url : input);
      assert.equal(url.href, `${endpoint}?uid=${uid}`);
      assert.equal(options?.method, 'GET');
      assert.equal(options?.cache, 'no-store');
      assert.equal(options?.redirect, 'error');
      assert.equal(options?.signal, signal);
      assert.deepEqual([...new Headers(options?.headers)], []);
      assert.equal(options?.body, undefined);
      return response({ projects: [
        { ...project(), state: 'draft', prompt: 'PRIVATE', user: 'not-an-authorization-check',
          originalLanguage: 'ca', translations: [
            { language: 'en', title: null, description: 'Partial', prompt: 'PRIVATE' },
            { language: 'es', title: '', description: null },
          ] },
        { ...project('9223372036854775807'), state: 'published', nas_folder: 'PRIVATE' },
      ], private: 'PRIVATE' });
    },
  });
  assert.equal(calls, 1);
  assert.equal(deadlines, 1);
  assert.deepEqual(result, [
    { ...project(), ...defaults, originalLanguage: 'ca', translations: [
      { language: 'en', title: null, description: 'Partial' },
      { language: 'es', title: '', description: null },
    ] }, { ...project('9223372036854775807'), ...defaults },
  ]);
});

test('public image URLs, category and year survive DTO reconstruction', async () => {
  const url = 'https://abcdefghijklmnopqrst.supabase.co/storage/v1/object/public/projects-images/house.jpg';
  const value = { ...project(), images: [{ url }], category: 'Residential', year: '2026' };
  assert.deepEqual(await fetchPublicProjects(endpoint, uid, {
    fetch: async () => response({ projects: [{ ...value, images: [{ url, prompt: 'PRIVATE' }] }] }),
  }), [value]);
});

test('legacy missing fields normalize while explicit empty and nullable fields remain intact', async () => {
  for (const fields of [{}, defaults, { images: [], category: '', year: '' }]) {
    assert.deepEqual(await fetchPublicProjects(endpoint, uid, {
      fetch: async () => response({ projects: [{ ...project(), ...fields }] }),
    }), [{ ...project(), ...defaults, ...fields }]);
  }
});

test('empty portfolios and subsequent fresh requests are not cached', async () => {
  let calls = 0;
  /** @type {typeof fetch} */
  const fixtureFetch = async () => response({ projects: calls++ === 0 ? [] : [{ ...project(), title: 'Updated' }] });
  assert.deepEqual(await fetchPublicProjects(endpoint, uid, { fetch: fixtureFetch }), []);
  assert.equal((await fetchPublicProjects(endpoint, uid, { fetch: fixtureFetch }))[0]?.title, 'Updated');
  assert.equal(calls, 2);
});

const unsafeEndpoints = [undefined, '', 'https://evil.test/functions/v1/public-projects',
  endpoint.replace('https:', 'http:'), endpoint.replace('.co/', '.co:443/'),
  endpoint.replace('https://', 'https://user:password@'), endpoint.replace('/functions/', '/rest/'),
  `${endpoint}/`, `${endpoint}?uid=${uid}`, `${endpoint}#fragment`, `${endpoint}\n`,
  endpoint.replace('abcdefghijklmnopqrst', 'short'), endpoint.replace('public-projects', '%70ublic-projects'),
];
for (const [index, unsafe] of unsafeEndpoints.entries()) {
  test(`unsafe or missing endpoint ${index} fails before fetch`, async () => {
    let calls = 0;
    await unavailable(() => fetchPublicProjects(unsafe, uid, {
      fetch: async () => { calls++; return response({ projects: [] }); },
    }));
    assert.equal(calls, 0);
  });
}
for (const invalid of [undefined, '', 'foreign', `${uid}\n`, `${uid}&uid=other`]) {
  test(`invalid owner ${JSON.stringify(invalid)} fails before fetch`, async () => {
    let calls = 0;
    await unavailable(() => fetchPublicProjects(endpoint, invalid, {
      fetch: async () => { calls++; return response({ projects: [] }); },
    }));
    assert.equal(calls, 0);
  });
}

const malformed = [null, [], {}, { projects: null }, { projects: {} },
  ...[null, [], { ...project(), title: undefined }, { ...project(), description: 1 },
    { ...project(), weblink: {} }, { ...project(), originalLanguage: 'fr' },
    ...[null, {}, 'image', [null], [{ url: 'https://evil.test/image.jpg' }]]
      .map((images) => ({ ...project(), images })),
    ...[42, [], {}, false].flatMap((value) => [
      { ...project(), category: value }, { ...project(), year: value },
    ]),
    { ...project(), originalLanguage: undefined }, { ...project(), translations: null },
    { ...project(), translations: [null] },
    { ...project(), translations: [{ language: 'fr', title: null, description: null }] },
    { ...project(), translations: [{ language: 'ca', title: null }] },
    { ...project(), translations: [{ language: 'en', title: 1, description: null }] },
    { ...project(), translations: [
      { language: 'en', title: null, description: null },
      { language: 'en', title: 'Duplicate', description: null },
    ] },
    ...['0', '-1', '01', '1.2', '1e2', '1\n', '9223372036854775808', 9007199254740992]
      .map((id) => ({ ...project(), id })),
  ].map((value) => ({ projects: [value] })),
  { projects: [project('2'), project('1')] },
  { projects: [project('1'), project('1')] },
  { projects: [project('1'), { ...project('2'), title: {} }] },
];
for (const [index, body] of malformed.entries()) {
  test(`invalid response ${index} fails closed without partial projects`, async () => {
    await unavailable(() => fetchPublicProjects(endpoint, uid, { fetch: async () => response(body) }));
  });
}

for (const language of ['es', 'en', 'ca', null]) {
  test(`original language ${language} remains exact, without fallback`, async () => {
    const value = { ...project('1'), title: null, description: '', weblink: 'https://example.test',
      originalLanguage: language, translations: [{ language: 'ca', title: null, description: null }] };
    assert.deepEqual(await fetchPublicProjects(endpoint, uid, {
      fetch: async () => response({ projects: [value] }),
    }), [{ ...value, ...defaults }]);
  });
}

for (const status of [302, 400, 403, 429, 500, 503]) {
  test(`HTTP ${status} is sanitized`, async () => {
    await unavailable(() => fetchPublicProjects(endpoint, uid, {
      fetch: async () => new Response('PRIVATE', { status, headers: { location: 'https://evil.test' } }),
    }));
  });
}

test('network errors, malformed JSON and rejected redirects are sanitized', async () => {
  for (const fetch of [
    async () => { throw new TypeError('PRIVATE redirect/network detail'); },
    async () => new Response('{PRIVATE'),
  ]) await unavailable(() => fetchPublicProjects(endpoint, uid, { fetch }));
});

test('expired deadline fails before fetch and during response consumption', async () => {
  const controller = new AbortController();
  controller.abort(new Error('PRIVATE timeout'));
  let calls = 0;
  await unavailable(() => fetchPublicProjects(endpoint, uid, {
    timeout: () => controller.signal,
    fetch: async () => { calls++; return response({ projects: [] }); },
  }));
  assert.equal(calls, 0);
  const pending = new AbortController();
  await unavailable(() => fetchPublicProjects(endpoint, uid, {
    timeout: () => pending.signal,
    fetch: async (_input, options) => {
      assert.equal(options?.signal, pending.signal);
      pending.abort(new Error('PRIVATE deadline'));
      return response({ projects: [project()] });
    },
  }));
});

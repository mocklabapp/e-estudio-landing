// @ts-check
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { fixture } from './helpers/build-fixture.mjs';

const project = {
  id: '1', title: 'Casa de prueba', description: 'Contenido público', weblink: null,
  originalLanguage: 'es', translations: [],
  images: [{ url: 'https://abcdefghijklmnopqrst.supabase.co/storage/v1/object/public/user-media/house.jpg' }],
  category: 'Residential', year: '2026',
};

for (const development of [true, false]) {
  test(`portfolio logs nothing in ${development ? 'development' : 'production'}`, async () => {
    delete process.env.MOCKLAB_PROJECTS_URL;
    delete process.env.MOCKLAB_USER_ID;
    const build = await fixture(async ({ root }) => {
      // Exercise both branches through the built public route, never real configuration.
      const path = join(root, 'src/pages/proyectos/index.astro');
      const source = await readFile(path, 'utf8');
      await writeFile(path, source.replaceAll('import.meta.env.DEV', String(development)));
    });
    assert.equal(build.status, 0, build.output);
    const module = await import(pathToFileURL(join(build.root, '.vercel/output/_functions/entry.mjs')).href);
    /** @type {unknown} */
    const handler = module.default;
    assert.ok(handler && typeof handler === 'object' && 'fetch' in handler);
    /** @type {unknown[][]} */
    const info = [];
    /** @type {unknown[][]} */
    const warnings = [];
    const original = { info: console.info, warn: console.warn, fetch: globalThis.fetch };
    try {
      console.info = (...args) => { info.push(args); };
      console.warn = (...args) => { warnings.push(args); };
      process.env.MOCKLAB_PROJECTS_URL = 'https://abcdefghijklmnopqrst.supabase.co/functions/v1/public-projects';
      process.env.MOCKLAB_USER_ID = '12345678-1234-4234-8234-123456789abc';
      globalThis.fetch = async () => Response.json({ projects: [{ ...project, prompt: 'private-detail' }] });
      assert.equal(typeof handler.fetch, 'function');
      if (typeof handler.fetch !== 'function') throw new Error('Missing handler');
      /** @type {unknown} */
      const success = await handler.fetch(new Request('https://example.test/proyectos/'));
      assert.ok(success instanceof Response);
      assert.equal(success.status, 200);
      assert.equal(success.headers.get('cache-control'), 'no-store');
      const html = await success.text();
      assert.ok(html.includes(project.title));
      assert.doesNotMatch(html, /\[projects\]|private-detail/);
      assert.deepEqual(info, []);
      assert.deepEqual(warnings, []);
      globalThis.fetch = async () => { throw new Error('private-upstream-secret'); };
      /** @type {unknown} */
      const failure = await handler.fetch(new Request('https://example.test/proyectos/'));
      assert.ok(failure instanceof Response);
      assert.equal(failure.status, 503);
      assert.equal(failure.headers.get('cache-control'), 'no-store');
      assert.deepEqual(warnings, []);
      assert.deepEqual(info, []);
      assert.doesNotMatch(JSON.stringify({ info, warnings }), /private-detail|private-upstream-secret|12345678/);
      assert.deepEqual(project.translations, []);
    } finally {
      console.info = original.info;
      console.warn = original.warn;
      globalThis.fetch = original.fetch;
      delete process.env.MOCKLAB_PROJECTS_URL;
      delete process.env.MOCKLAB_USER_ID;
    }
  });
}

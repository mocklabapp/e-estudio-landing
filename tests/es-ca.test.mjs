// @ts-check
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { fixture } from './helpers/build-fixture.mjs';
import { simulateContactPreview } from '../src/lib/contact-preview.ts';

const origin = 'https://abcdefghijklmnopqrst.supabase.co';
const noStore = ['cache-control', 'cdn-cache-control', 'vercel-cdn-cache-control'];

test('ES/CA editorial routes and equivalent navbar links preserve the client shell', async () => {
  const build = await fixture();
  assert.equal(build.status, 0, build.output);
  for (const [slug, spanish, title, copy] of [
    ['estudi', 'estudio', 'Estudi', 'Creem espais,'],
    ['serveis', 'servicios', 'Serveis', 'Ampliacions i reformes'],
    ['living-research', 'living-research', 'Living Research', 'La manera d’habitar està canviant.'],
    ['contacte', 'contacto', 'Contacte', 'No s’envien ni es guarden dades.'],
  ]) {
    const html = await build.html(`ca/${slug}/index.html`);
    assert.match(html, /<html lang="ca" dir="ltr">/);
    assert.ok(html.includes(`<title>${title} | e estudio</title>`));
    assert.ok(html.includes(copy), copy);
    const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
    assert.ok(header);
    assert.match(header, /href="\/ca\/projectes\/"/);
    assert.ok(header.includes(`href="/${spanish}/" lang="es"`));
    assert.ok(header.includes(`href="/ca/${slug}/" lang="ca"`));
    assert.match(header, />ES<|>\s*ES\s*</);
    assert.match(header, />CA<|>\s*CA\s*</);
    assert.ok(html.includes(`hreflang="ca" href="https://example.test/ca/${slug}/"`));
    assert.match(html, /href="\/ca\/contacte\/"/);
    assert.doesNotMatch(html, /href="\/en\/"/);
  }
  const contact = await build.html('ca/contacte/index.html');
  assert.match(contact, /mailto:hola@eestudiohabitar.com/);
  assert.match(contact, /tel:\+34615123456/);
  assert.match(contact, /Simular l’enviament/);
  assert.doesNotMatch(contact, /<form\b|\baction=/);
});

test('both locales fetch fresh projects over HTTP with whole-content fallback and localized metadata', async (t) => {
  const build = await fixture();
  assert.equal(build.status, 0, build.output);
  const module = await import(pathToFileURL(join(build.root, '.vercel/output/_functions/entry.mjs')).href);
  /** @type {unknown} */
  const handler = module.default;
  assert.ok(handler && typeof handler === 'object' && 'fetch' in handler);
  const nativeFetch = globalThis.fetch;
  let calls = 0;
  let failed = false;
  let version = 1;
  let complete = true;
  let empty = false;
  let category = 'publico';
  const server = createServer(async (req, res) => {
    try {
      if (typeof handler.fetch !== 'function') throw new Error('Missing handler');
      /** @type {unknown} */
      const response = await handler.fetch(new Request(`https://example.test${req.url}`));
      assert.ok(response instanceof Response);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
    } catch {
      res.writeHead(500);
      res.end('Fixture failure');
    }
  });
  try {
    process.env.MOCKLAB_PROJECTS_URL = `${origin}/functions/v1/public-projects`;
    process.env.MOCKLAB_USER_ID = '12345678-1234-4234-8234-123456789abc';
    globalThis.fetch = async () => {
      calls++;
      if (failed) return new Response('private-upstream-detail', { status: 500 });
      return Response.json({ projects: empty ? [] : [{
        id: '42', title: `Original ${version}`, description: 'Descripción original completa.',
        originalLanguage: 'es', weblink: null, images: [], category, year: '2026',
        translations: [{ language: 'ca', title: `Traducció ${version}`,
          description: complete ? 'Descripció catalana completa.' : null }],
      }] });
    };
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    /** @param {string} path @param {number} [status] */
    const page = async (path, status = 200) => {
      const response = await nativeFetch(`http://127.0.0.1:${address.port}${path}`);
      assert.equal(response.status, status, path);
      for (const name of noStore) assert.equal(response.headers.get(name), 'no-store', path);
      const html = await response.text();
      assert.doesNotMatch(html, /private-upstream-detail/);
      return html;
    };
    await t.test('home, list and detail select complete translations and keep equivalent IDs', async () => {
      for (const path of ['/', '/proyectos/', '/proyectos/42/']) {
        const html = await page(path);
        assert.match(html, /Original 1/);
        assert.match(html, /Espacio público/);
        assert.match(html, /<html lang="es"/);
      }
      for (const path of ['/ca/', '/ca/projectes/', '/ca/projectes/42/']) {
        const html = await page(path);
        assert.match(html, /Traducció 1/);
        assert.match(html, /Espai públic/);
        assert.match(html, /Imatge pendent/);
        assert.match(html, /<html lang="ca"/);
        assert.doesNotMatch(html, /Original 1|Imagen pendiente/);
      }
      const detail = await page('/ca/projectes/42/');
      assert.match(detail, /<title>Traducció 1 \| e estudio<\/title>/);
      assert.match(detail, /name="description" content="Descripció catalana completa\."/);
      assert.match(detail, /href="\/proyectos\/42\/" lang="es"/);
      assert.match(detail, /hreflang="es" href="https:\/\/example.test\/proyectos\/42\/"/);
      assert.match(detail, /rel="canonical" href="https:\/\/example.test\/ca\/projectes\/42\/"/);
    });
    await t.test('incomplete translation uses the whole original on refreshed requests', async () => {
      version = 2;
      complete = false;
      for (const path of ['/ca/', '/ca/projectes/', '/ca/projectes/42/']) {
        const html = await page(path);
        assert.match(html, /Original 2/);
        assert.doesNotMatch(html, /Traducció|Original 1/);
        if (path.endsWith('/42/')) {
          assert.match(html, /name="description" content="Descripción original completa\."/);
        }
      }
    });
    await t.test('unknown Catalan categories are omitted without losing the year', async () => {
      category = 'unknown-category';
      for (const path of ['/ca/', '/ca/projectes/', '/ca/projectes/42/']) {
        const html = await page(path);
        assert.match(html, /2026/);
        assert.doesNotMatch(html, /unknown-category|Espai públic/);
      }
    });
    await t.test('invalid and absent IDs, empty portfolios and failures preserve no-store', async () => {
      const before = calls;
      await page('/ca/projectes/invalid/', 404);
      assert.equal(calls, before, 'Invalid IDs must not fetch');
      await page('/ca/projectes/9223372036854775808/', 404);
      assert.equal(calls, before);
      await page('/ca/projectes/43/', 404);
      empty = true;
      assert.match(await page('/ca/'), /Encara no hi ha projectes disponibles/);
      assert.match(await page('/ca/projectes/'), /Encara no hi ha projectes disponibles/);
      failed = true;
      for (const path of ['/', '/ca/', '/proyectos/', '/ca/projectes/', '/proyectos/42/', '/ca/projectes/42/']) {
        await page(path, 503);
      }
    });
  } finally {
    globalThis.fetch = nativeFetch;
    delete process.env.MOCKLAB_PROJECTS_URL;
    delete process.env.MOCKLAB_USER_ID;
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});

test('Catalan contact simulation preserves validation and no-send guarantees', () => {
  const values = { name: '', contact: 'invalid', subject: '', message: '' };
  const invalid = simulateContactPreview(values, 'ca');
  assert.equal(invalid.valid, false);
  assert.equal(invalid.errors.name, 'Completa aquest camp.');
  assert.match(invalid.errors.contact ?? '', /correu electrònic o telèfon/);
  const valid = simulateContactPreview({ name: 'Demo', contact: 'demo@example.test', subject: 'Test', message: 'Test' }, 'ca');
  assert.equal(valid.valid, true);
  assert.match(valid.status, /No s’ha enviat cap missatge ni s’han guardat dades/);
  assert.doesNotMatch(valid.status, /demo@example.test/);
});

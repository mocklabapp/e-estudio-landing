// @ts-check
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { renderUnconfiguredHome } from './helpers/build-fixture.mjs';
import test from 'node:test';

const html = await renderUnconfiguredHome(fileURLToPath(new URL('../', import.meta.url)));

test('the client shell exposes primary navigation and a skip link', () => {
  assert.match(html, /href="#main-content"/);
  assert.match(html, /id="main-content"/);
  for (const path of ['estudio', 'proyectos', 'servicios', 'living-research', 'contacto']) {
    assert.ok(html.includes(`href="/${path}/"`), `Missing ${path} navigation`);
  }
  assert.match(html, /<footer\b/);
});

test('the preview uses the client identity without external font requests', () => {
  assert.match(html, /<title>e estudio<\/title>/);
  assert.match(html, /Arquitectura residencial/);
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/);
});

test('the mobile menu trigger is a three-line icon with a visually hidden label', () => {
  const summary = html.match(/<summary\b[^>]*>[\s\S]*?<\/summary>/)?.[0];
  assert.ok(summary, 'Missing mobile menu summary');
  assert.match(summary, /<svg\b[^>]*aria-hidden="true"/);
  assert.equal([...summary.matchAll(/<(?:line|path)\b/g)].length, 3);
  assert.match(summary, /<span class="sr-only[^"]*"[^>]*>Menú<\/span>/);
  assert.doesNotMatch(summary, /☰/);
});

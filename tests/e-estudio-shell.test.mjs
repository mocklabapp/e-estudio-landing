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

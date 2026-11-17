// @ts-check
// Shell, Studio and palette adjustments from the 13 November 2026 client brief.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { renderUnconfiguredHome } from './helpers/build-fixture.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
/** @param {string} route */
const page = (route) => readFile(new URL(`../dist/client/${route}index.html`, import.meta.url), 'utf8');
const home = await renderUnconfiguredHome(root);
const studio = await page('estudio/');
const studioCa = await page('ca/estudi/');
const services = await page('servicios/');

/** @param {string} html */
const footerOf = (html) => {
  const match = html.match(/<footer\b[\s\S]*<\/footer>/);
  assert.ok(match, 'Missing footer');
  return match[0];
};

test('the palette uses #555555 for secondary text and never pure black', async () => {
  const tokens = await readFile(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
  assert.match(tokens, /--color-muted: #555555;/);
  assert.doesNotMatch(tokens, /#000(000)?\b/i);
});

test('every footer shows the real contact data and social link', () => {
  for (const html of [home, studio, studioCa, services]) {
    const footer = footerOf(html);
    assert.match(footer, /href="tel:\+34615123456"/);
    assert.match(footer, /href="mailto:hola@eestudiohabitar\.com"/);
    assert.match(footer, /href="https:\/\/www\.instagram\.com\/e_estudio_habitar\/"/);
    assert.match(footer, /Plaça de l’Església, 23/);
  }
});

test('the footer is a white band so it never follows another coloured band', () => {
  const footer = footerOf(services);
  assert.match(footer, /^<footer[^>]*\bbg-canvas\b/);
  assert.doesNotMatch(footer.slice(0, footer.indexOf('>')), /bg-(surface|sand)/);
});

test('Studio recovers fine dividers between its sections', () => {
  for (const html of [studio, studioCa]) {
    const dividers = html.match(/<hr\b[^>]*class="[^"]*studio-divider/g) ?? [];
    assert.ok(dividers.length >= 3, `Expected at least 3 Studio dividers, found ${dividers.length}`);
  }
});

test('Studio contact access carries a small navigation arrow', () => {
  assert.match(studio, /href="\/contacto\/"[^>]*>\s*<span[^>]*>Contacto<\/span>\s*<span aria-hidden="true"[^>]*>⟶<\/span>/);
  assert.match(studioCa, /href="\/ca\/contacte\/"[^>]*>\s*<span[^>]*>Contacte<\/span>\s*<span aria-hidden="true"[^>]*>⟶<\/span>/);
});

test('Studio keeps the «Clientes y colaboradores» name', () => {
  assert.match(studio, /Clientes y colaboradores/);
});

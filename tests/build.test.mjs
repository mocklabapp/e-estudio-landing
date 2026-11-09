// @ts-check
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { renderUnconfiguredHome } from './helpers/build-fixture.mjs';
import { site } from '../src/config/site.ts';

const html = await renderUnconfiguredHome(fileURLToPath(new URL('../', import.meta.url)));
/** @param {string} value */
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => {
  /** @type {Record<string, string>} */
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return entities[character];
});

test('the home page renders the shared site identity', () => {
  assert.ok(html.includes(`<title>${escapeHtml(site.name)}</title>`));
  assert.ok(html.includes(`<h1>${escapeHtml(site.name)}</h1>`));
  assert.ok(html.includes(`<p>${escapeHtml(site.description)}</p>`));
});

test('the layout renders document language and metadata', () => {
  assert.ok(html.includes(`<html lang="${site.language}" dir="ltr">`));
  assert.ok(html.includes('name="viewport"'));
  assert.ok(html.includes(`name="description" content="${escapeHtml(site.description)}"`));
  assert.ok(html.includes('<main'));
});

const inlineStyles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)]
  .map((match) => match[1]);
const stylesheets = await Promise.all(
  [...html.matchAll(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g)]
    .map((match) => readFile(new URL(`../dist/client${match[1]}`, import.meta.url), 'utf8')),
);
const css = [...inlineStyles, ...stylesheets].join('\n');

test('Tailwind compiles the semantic utilities used by the shared layout', () => {
  assert.match(html, /<body\b[^>]*class="[^"]*bg-canvas[^"]*"/);
  assert.match(css, /\.bg-canvas\s*\{/);
  assert.match(css, /\.text-ink\s*\{/);
  assert.match(css, /\.font-sans\s*\{/);
  assert.doesNotMatch(css, /@(?:import\s*["']tailwindcss|theme\b)/);
});

test('the generated theme exposes semantic tokens instead of a default color palette', () => {
  for (const name of ['canvas', 'surface', 'ink', 'muted', 'line', 'brand', 'on-brand']) {
    assert.match(css, new RegExp(`--color-${name}\\s*:`));
  }
  assert.doesNotMatch(css, /--color-(?:red|blue|green)-\d+\s*:/);
});

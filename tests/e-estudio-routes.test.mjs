// @ts-check
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

for (const [route, title] of [
  ['estudio', 'Estudio'],
  ['servicios', 'Servicios'],
  ['living-research', 'Living Research'],
  ['contacto', 'Contacto'],
]) {
  test(`the Spanish ${route} page renders inside the shared client shell`, async () => {
    const html = await readFile(new URL(`../dist/client/${route}/index.html`, import.meta.url), 'utf8');
    assert.ok(html.includes(`<title>${title} | e estudio</title>`));
    assert.match(html, /<html lang="es" dir="ltr">/);
    assert.match(html, /id="main-content"/);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.match(html, /<footer\b/);
    assert.doesNotMatch(html, /href="#"/);
    if (route === 'living-research') assert.doesNotMatch(html, /<form\b|type="checkbox"|>Votar\s*</);
  });
}

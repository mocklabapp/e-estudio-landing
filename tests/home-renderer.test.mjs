// @ts-check
import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './helpers/build-fixture.mjs';

test('registry siblings and generic translations build statically without accessing projects', async () => {
  const build = await fixture(async ({ replace }) => {
    // Explicitly model the generic ES/EN scenario, independently of the client locales.
    await replace('src/i18n/locales.ts', "= ['es', 'ca'];", "= ['es', 'en'];");
    await replace('src/lib/projects.ts',
      "return fetchPublicProjects(getSecret('MOCKLAB_PROJECTS_URL'), getSecret('MOCKLAB_USER_ID'));",
      "throw new Error('Static rendering must not access live projects');");
    await replace('src/data/pages.ts', 'export const pages: Page[] = [', `export const pages: Page[] = [
      { id: 'notes', translations: {
        es: { slug: 'notas', title: 'Notas', description: 'Descripción.', body: 'Contenido.' },
        en: { slug: 'notes', title: 'Notes', description: 'Description.', body: 'Content.' },
      } },`);
  });
  assert.equal(build.status, 0, build.output);
  for (const path of ['estudio', 'servicios', 'living-research', 'contacto']) {
    const html = await build.html(`${path}/index.html`);
    assert.match(html, /<html lang="es" dir="ltr">/);
    assert.match(html, /<header\b/);
    assert.match(html, /<footer\b/);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.ok(html.includes(`rel="canonical" href="https://example.test/${path}/"`));
  }
  for (const [path, locale, title, description, body] of [
    ['notas', 'es', 'Notas', 'Descripción.', 'Contenido.'],
    ['en/notes', 'en', 'Notes', 'Description.', 'Content.'],
  ]) {
    const html = await build.html(`${path}/index.html`);
    assert.ok(html.includes(`<html lang="${locale}" dir="ltr">`));
    assert.ok(html.includes(`<title>${title} | e estudio</title>`));
    assert.ok(html.includes(`name="description" content="${description}"`));
    assert.ok(html.includes(`<h1>${title}</h1><p>${body}</p>`));
    assert.match(html, /hreflang="es" href="https:\/\/example.test\/notas\/"/);
    assert.match(html, /hreflang="en" href="https:\/\/example.test\/en\/notes\/"/);
    assert.doesNotMatch(html, /<header\b|<footer\b|Proyectos destacados/);
  }
  const englishHome = await build.html('en/index.html');
  assert.match(englishHome, /<html lang="en" dir="ltr">/);
  assert.match(englishHome, /<p>A clear starting point for your next website\.<\/p>/);
  assert.match(englishHome, /Language navigation/);
  assert.doesNotMatch(englishHome, /Proyectos destacados/);
});

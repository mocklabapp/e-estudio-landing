// @ts-check
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test, { after } from 'node:test';
import { fixture } from './helpers/build-fixture.mjs';
import { site } from '../src/config/site.ts';

/** @param {string} text */
const htmlText = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const renamedSite = 'Clínica Norte & Salud';

const originals = ['astro.config.mjs', 'src/i18n/locales.ts', 'src/i18n/ui.ts', 'src/data/pages.ts'];
const before = await Promise.all(originals.map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));
after(async () => {
  assert.deepEqual(await Promise.all(originals.map((path) =>
    readFile(new URL(`../${path}`, import.meta.url), 'utf8'))), before);
});
/** @param {import('./helpers/build-fixture.mjs').FixtureInput} input */
const enableEnglish = ({ replace }) => replace('src/i18n/locales.ts', "= ['es', 'ca'];", "= ['es', 'en'];");
/** @param {Awaited<ReturnType<typeof fixture>>} result */
const success = (result) => assert.equal(result.status, 0, result.output);
/**
 * @param {Awaited<ReturnType<typeof fixture>>} result
 * @param {string} diagnostic
 */
const rejected = (result, diagnostic) => {
  assert.equal(result.status, 1, result.output);
  assert.ok(result.output.includes(diagnostic), result.output);
};
const spanishOnly = fixture(({ replace }) =>
  replace('src/i18n/locales.ts', "= ['es', 'ca'];", "= ['es'];"));
const bilingual = fixture(async (input) => {
  await enableEnglish(input);
  const source = await readFile(new URL('../src/config/site.ts', import.meta.url), 'utf8');
  const nameLine = source.match(/^  name: .+,$/m)?.[0];
  assert.ok(nameLine, 'site identity must remain an explicit shared configuration field');
  await input.replace('src/config/site.ts', nameLine, `  name: ${JSON.stringify(renamedSite)},`);
});

test('default build publishes Spanish content and metadata', async () => {
  const result = await spanishOnly;
  success(result);
  const html = await result.html();
  assert.match(html, /<html lang="es" dir="ltr">/);
  assert.ok(html.includes(`<h1>${htmlText(site.name)}</h1>`));
  assert.ok(html.includes(`<p>${htmlText(site.description)}</p>`));
  assert.ok(html.includes(`name="description" content="${htmlText(site.description)}"`));
});

test('disabled English generates no output, selector or hreflang references', async () => {
  const result = await spanishOnly;
  success(result);
  await assert.rejects(result.html('en/index.html'), { code: 'ENOENT' });
  const html = await result.html();
  assert.doesNotMatch(html, /\/en\/|hreflang="en"|aria-label="Navegación de idiomas"/);
  assert.match(html, /rel="canonical" href="https:\/\/example.test\/"/);
});

test('renamed client build preserves opt-in English content, UI and shared identity', async () => {
  const result = await bilingual;
  success(result);
  const html = await result.html('en/index.html');
  assert.match(html, /<html lang="en" dir="ltr">/);
  assert.ok(html.includes(`<title>${htmlText(renamedSite)}</title>`));
  assert.ok(html.includes(`<h1>${htmlText(renamedSite)}</h1>`));
  assert.match(html, /name="description" content="A clear starting point for your next website\."/);
  assert.match(html, /<p>A clear starting point for your next website\.<\/p>/);
  assert.match(html, /<nav aria-label="Language navigation">/);
  assert.match(html, /<span>Language<\/span>/);
  assert.match(html, /href="\/en\/" lang="en" hreflang="en" aria-current="page">English/);
  assert.match(html, /href="\/" lang="es" hreflang="es">Español/);
  const spanish = await result.html();
  assert.ok(spanish.includes(`<title>${htmlText(renamedSite)}</title>`));
  assert.ok(spanish.includes(`<h1>${htmlText(renamedSite)}</h1>`));
  assert.match(spanish, /aria-label="Navegación de idiomas"/);
  assert.match(spanish, /<span[^>]*>Idioma<\/span>/);
});

test('canonical and reciprocal hreflang use the configured production site', async () => {
  const result = await bilingual;
  success(result);
  for (const [file, path] of [['index.html', '/'], ['en/index.html', '/en/']]) {
    const html = await result.html(file);
    assert.ok(html.includes(`rel="canonical" href="https://example.test${path}"`));
    for (const [lang, url] of [['es', '/'], ['en', '/en/'], ['x-default', '/']]) {
      assert.ok(html.includes(`rel="alternate" hreflang="${lang}" href="https://example.test${url}"`));
    }
  }
});

test('unset site omits absolute SEO links without disabling language navigation', async () => {
  const result = await fixture(enableEnglish, { site: false });
  success(result);
  const html = await result.html();
  assert.doesNotMatch(html, /rel="canonical"|rel="alternate"/);
  assert.match(html, /href="\/en\/"/);
});

test('a third configured language works while English remains disabled', async () => {
  const result = await fixture(async ({ replace }) => {
    await replace('src/i18n/locales.ts', '  en:', "  fr: { label: 'Français', lang: 'fr', dir: 'ltr' },\n  en:");
    await replace('src/i18n/locales.ts', "= ['es', 'ca'];", "= ['es', 'fr'];");
    await replace('src/i18n/ui.ts', '  en:', "  fr: { navigation: 'Navigation des langues', languageSwitcher: 'Langue' },\n  en:");
    await replace('src/data/pages.ts', '      en: {', `      fr: {
        slug: '', title: site.name, description: 'Un point de départ clair.', body: 'Un point de départ clair.',
      },
      en: {`);
  });
  success(result);
  const html = await result.html('fr/index.html');
  assert.match(html, /<html lang="fr" dir="ltr">/);
  assert.match(html, /Un point de départ clair\./);
  assert.match(html, /Navigation des langues/);
  assert.match(html, /hreflang="fr"/);
  assert.doesNotMatch(html, /\/en\/|hreflang="en"/);
  await assert.rejects(result.html('en/index.html'), { code: 'ENOENT' });
});

test('registered RTL direction and HTML language reach generated markup', async () => {
  const result = await fixture(async ({ replace }) => {
    await replace('src/i18n/locales.ts', '  en:', "  ar: { label: 'العربية', lang: 'ar', dir: 'rtl' },\n  en:");
    await replace('src/i18n/locales.ts', "= ['es', 'ca'];", "= ['es', 'ar'];");
    await replace('src/i18n/ui.ts', '  en:', "  ar: { navigation: 'التنقل بين اللغات', languageSwitcher: 'اللغة' },\n  en:");
    await replace('src/data/pages.ts', '      en: {', `      ar: {
        slug: '', title: site.name, description: 'نقطة بداية واضحة.', body: 'نقطة بداية واضحة.',
      },
      en: {`);
  });
  success(result);
  assert.match(await result.html('ar/index.html'), /<html lang="ar" dir="rtl">/);
});

test('translated slugs preserve page identity and omit unavailable page translations', async () => {
  const result = await fixture(async (input) => {
    await enableEnglish(input);
    await input.replace('src/data/pages.ts', 'export const pages: Page[] = [', `export const pages: Page[] = [
      { id: 'about', translations: {
        es: { slug: 'acerca', title: 'Acerca', description: 'Descripción de prueba.', body: 'Contenido de prueba.' },
        en: { slug: 'about', title: 'About', description: 'Test description.', body: 'Test content.' },
      } },
      { id: 'notes', translations: {
        es: { slug: 'notas', title: 'Notas', description: 'Solo español.', body: 'Solo español.' },
      } },`);
  });
  success(result);
  const spanish = await result.html('acerca/index.html');
  const english = await result.html('en/about/index.html');
  assert.ok(spanish.includes(`<title>Acerca | ${htmlText(site.name)}</title>`));
  assert.ok(english.includes(`<title>About | ${htmlText(site.name)}</title>`));
  for (const html of [spanish, english]) {
    assert.match(html, /href="\/acerca\/" lang="es"/);
    assert.match(html, /href="\/en\/about\/" lang="en"/);
    assert.match(html, /hreflang="en" href="https:\/\/example.test\/en\/about\/"/);
    assert.doesNotMatch(html, /href="\/en\/"/);
  }
  const notes = await result.html('notas/index.html');
  assert.doesNotMatch(notes, /<nav|hreflang="en"|\/en\//);
  await assert.rejects(result.html('en/notas/index.html'), { code: 'ENOENT' });
});

test('duplicate stable page IDs fail even with distinct published paths', async () => {
  const result = await fixture(async ({ replace }) => {
    await replace('src/data/pages.ts', 'export const pages: Page[] = [', `export const pages: Page[] = [
      { id: 'audit-duplicate', translations: {
        es: { slug: 'audit-one', title: 'First', description: 'Test description.', body: 'Test content.' },
      } },
      { id: 'audit-duplicate', translations: {
        es: { slug: 'audit-two', title: 'Second', description: 'Test description.', body: 'Test content.' },
      } },`);
  });
  rejected(result, '[i18n] Duplicate page ID audit-duplicate.');
  await assert.rejects(result.html('audit-one/index.html'), { code: 'ENOENT' });
  await assert.rejects(result.html('audit-two/index.html'), { code: 'ENOENT' });
});

test('colliding published paths fail before static generation', async () => {
  const result = await fixture(async (input) => {
    await enableEnglish(input);
    await input.replace('src/data/pages.ts', 'export const pages: Page[] = [', `export const pages: Page[] = [
      { id: 'spanish-guide', translations: {
        es: { slug: 'en', title: 'Guía', description: 'Descripción de prueba.', body: 'Contenido de prueba.' },
      } },`);
  });
  rejected(result, '[i18n] Colliding published path /en/: spanish-guide/es and home/en.');
});

test('an incomplete published translation fails with an intentional diagnostic', async () => {
  const result = await fixture(async (input) => {
    await enableEnglish(input);
    await input.replace('src/data/pages.ts', "body: 'A clear starting point for your next website.'", "body: ''");
  });
  rejected(result, '[i18n] Incomplete translation for home/en.');
});

test('an absent mandatory Spanish translation fails with an intentional diagnostic', async () => {
  const result = await fixture(async ({ replace }) => {
    await replace('src/data/pages.ts',
      "      es: { slug: '', title: site.name, description: site.description, body: site.description },", '');
  });
  rejected(result, '[i18n] Missing Spanish translation for page home.');
});

test('disabling Spanish is rejected by the public config build', async () => {
  const result = await fixture(({ replace }) =>
    replace('src/i18n/locales.ts', "= ['es', 'ca'];", "= ['en'];"));
  rejected(result, '[i18n] Spanish (es) must be enabled.');
});

test('an unknown enabled locale is rejected by the public config build', async () => {
  const result = await fixture(({ replace }) =>
    replace('src/i18n/locales.ts', "= ['es', 'ca'];", "= ['es', 'xx'];"));
  rejected(result, '[i18n] Unknown enabled locale: xx.');
});

test('incomplete UI for an enabled locale is rejected', async () => {
  const result = await fixture(async (input) => {
    await enableEnglish(input);
    await input.replace('src/i18n/ui.ts', "navigation: 'Language navigation'", "navigation: ''");
  });
  rejected(result, '[i18n] Incomplete UI for en.');
});

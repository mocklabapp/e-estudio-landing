// @ts-check
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { fixture } from './helpers/build-fixture.mjs';
import { images, paragraphs, pilotProject } from './fixtures/pilot-project.ts';

/** @param {string} html */
const imageTags = (html) => [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
/** @param {string} html */
const imageSources = (html) => imageTags(html).map((tag) => tag.match(/src="([^"]+)"/)?.[1]);

const owner = '12345678-1234-4234-8234-123456789abc';
const upstream = 'https://abcdefghijklmnopqrst.supabase.co/functions/v1/public-projects';
const headers = ['cache-control', 'cdn-cache-control', 'vercel-cdn-cache-control'];

test('all category renderers use the actual English page locale, not the Spanish pilot content language', async () => {
  // Mount existing consumers on an isolated English page; production routes stay unchanged.
  const project = { ...pilotProject, category: 'publico', images: [], description: null };
  const build = await fixture(async ({ replace }) => {
    await replace('src/i18n/locales.ts', "= ['es', 'ca'];", "= ['es', 'en'];");
    await replace('src/components/shared/PageRenderer.astro', "import { site }", `
import ProjectCard from '@/components/projects/ProjectCard.astro';
import ProjectDetail from '@/components/projects/ProjectDetail.astro';
import HomeProjectCard from '@/components/home/HomeProjectCard.astro';
const categoryProject: PublicProject = ${JSON.stringify(project)};
import { site }`);
    await replace('src/components/shared/PageRenderer.astro', '{!clientPage && <LanguageSwitcher page={page} />}', `
<LanguageSwitcher page={page} />
{page.locale === 'en' && <>
  <section aria-label="Category card"><ProjectCard project={categoryProject} /></section>
  <section aria-label="Category detail"><ProjectDetail project={categoryProject} /></section>
  <section aria-label="Category home"><HomeProjectCard project={categoryProject} /></section>
</>}`);
  });
  assert.equal(build.status, 0, build.output);
  const html = await build.html('en/index.html');
  assert.match(html, /<html lang="en"/);
  for (const consumer of ['card', 'detail', 'home']) {
    const section = html.match(new RegExp(`<section aria-label="Category ${consumer}">([\\s\\S]*?)</section>`))?.[1];
    assert.ok(section);
    assert.match(section, /Public space/);
    assert.match(section, /Test 4/);
    assert.doesNotMatch(section, /Espacio público|>publico</);
  }
});

test('portfolio HTML uses the fixed owner, reflects updates and handles missing data safely', async (t) => {
  delete process.env.MOCKLAB_PROJECTS_URL;
  delete process.env.MOCKLAB_USER_ID;
  const build = await fixture();
  assert.equal(build.status, 0, build.output);
  const module = await import(pathToFileURL(join(build.root, '.vercel/output/_functions/entry.mjs')).href);
  /** @type {unknown} */
  const handler = module.default;
  assert.ok(handler && typeof handler === 'object' && 'fetch' in handler);
  /** @param {string} path */
  const request = async (path) => {
    assert.equal(typeof handler.fetch, 'function');
    if (typeof handler.fetch !== 'function') throw new Error('Missing handler');
    /** @type {unknown} */
    const result = await handler.fetch(new Request(`https://example.test${path}`));
    assert.ok(result instanceof Response);
    for (const name of headers) assert.equal(result.headers.get(name), 'no-store');
    return { status: result.status, html: await result.text() };
  };
  const nativeFetch = globalThis.fetch;
  let version = 1;
  let calls = 0;
  let pilot = structuredClone(pilotProject);
  try {
    const missingConfiguration = await request('/proyectos/');
    assert.equal(missingConfiguration.status, 503);
    assert.match(missingConfiguration.html, /No podemos mostrar los proyectos/);
    process.env.MOCKLAB_PROJECTS_URL = upstream;
    process.env.MOCKLAB_USER_ID = owner;
    globalThis.fetch = async (input, options) => {
      const url = new URL(input instanceof Request ? input.url : input);
      calls++;
      assert.equal(url.origin + url.pathname, upstream);
      assert.deepEqual([...url.searchParams], [['uid', owner]]);
      assert.equal(options?.cache, 'no-store');
      if (version === 3) return new Response('private-database-detail', { status: 500 });
      return Response.json({ projects: version === 4 ? [] : [{
        id: '1', title: `Casa <script> v${version}`, description: 'Un espacio para vivir.',
        weblink: 'javascript:alert(1)', originalLanguage: 'es', translations: [],
        prompt: 'private-database-detail',
      }, {
        id: '2', title: 'Not Spanish', description: 'Must not leak',
        weblink: null, originalLanguage: 'en', translations: [],
      }, pilot] });
    };
    const listing = await request('/proyectos/?uid=foreign');
    assert.equal(listing.status, 200);
    assert.match(listing.html, /Casa &lt;script&gt; v1/);
    assert.match(listing.html, /href="\/proyectos\/1\/"/);
    assert.match(listing.html, /Not Spanish/);
    assert.doesNotMatch(listing.html, /javascript:|private-database-detail/);
    const detail = await request('/proyectos/1/');
    assert.equal(detail.status, 200);
    assert.match(detail.html, /Un espacio para vivir\./);
    assert.match(detail.html, /Imagen pendiente/);
    await t.test('list shows only the first image, title, category and year', () => {
      const card = listing.html.match(/<article\b[^>]*>\s*<a href="\/proyectos\/441\/"[\s\S]*?<\/article>/)?.[0];
      assert.ok(card, 'Pilot card must link to its detail');
      assert.deepEqual(imageSources(card), [images[0].url]);
      assert.match(card, /<h2\b[^>]*>Test 4<\/h2>/);
      assert.match(card, /<dd>Residencial<\/dd>/);
      assert.match(card, /2026/);
      assert.doesNotMatch(card, /Contenido en español pendiente/);
      assert.match(imageTags(card)[0], /alt="[^"]*Test 4[^"]*"/);
      assert.match(imageTags(card)[0], /loading="lazy"/);
    });
    await t.test('detail keeps the complete narrative and ordered gallery including repeated images', async () => {
      const result = await request('/proyectos/441/');
      assert.equal(result.status, 200);
      const body = result.html.split('</head>')[1];
      const gallery = body.match(/<section\b[^>]*aria-label="Imágenes de Test 4"[^>]*>([\s\S]*?)<\/section>/)?.[1];
      assert.ok(gallery, 'Detail must expose a labelled project gallery');
      const hero = body.match(/<figure\b[^>]*aria-label="Imagen principal"[^>]*>[\s\S]*?<\/figure>/)?.[0];
      assert.ok(hero, 'Detail must lead with a primary image');
      assert.deepEqual(imageSources(hero), [images[0].url]);
      assert.match(imageTags(hero)[0], /loading="eager"/);
      assert.ok(body.indexOf(hero) < body.indexOf(paragraphs[0]));
      assert.deepEqual(imageSources(gallery), images.slice(1).map(({ url }) => url));
      assert.match(body, /Residencial · 2026/);
      assert.match(body, /2026/);
      for (const paragraph of paragraphs) assert.ok(body.includes(paragraph), 'Full paragraph must survive');
      for (const [index, tag] of imageTags(gallery).entries()) {
        assert.ok(tag.includes(`alt="Test 4 — imagen ${index + 2} de ${images.length}"`));
        assert.match(tag, /loading="lazy"/);
      }
      assert.doesNotMatch(body, /Etapas del proyecto|Imagen pendiente|ficha técnica.*pendientes/);
      assert.doesNotMatch(body, /<h[2-6][^>]*>(PERSONA|DESEO|PROYECTO|OBRA|VIDA)/);
    });
    await t.test('short and long narratives adapt without losing text or duplicating a single image', async () => {
      try {
        for (const [description, layout] of [['Una casa abierta al paisaje.', 'alongside'], ['Una casa abierta al paisaje. '.repeat(30), 'below']]) {
        pilot = { ...pilotProject, description, images: [images[0]], category: null, year: null };
        const { status, html } = await request('/proyectos/441/');
        const body = html.split('</head>')[1];
        assert.equal(status, 200);
        assert.match(body, new RegExp(`data-description-layout="${layout}"`));
        assert.ok(body.includes(description));
        const main = body.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
        assert.ok(main);
        assert.deepEqual(imageSources(main), [images[0].url]);
        assert.doesNotMatch(main, /aria-label="Imágenes de|Residencial|2026|Imagen pendiente/);
        }
      } finally {
        pilot = structuredClone(pilotProject);
      }
    });
    await t.test('unknown categories are omitted while years remain in cards and detail', async () => {
      try {
        for (const year of ['2026', null]) {
          pilot = { ...pilotProject, category: 'unknown-category', year };
          const listing = await request('/proyectos/');
          const detail = await request('/proyectos/441/');
          assert.equal(listing.status, 200);
          assert.equal(detail.status, 200);
          const card = listing.html.match(/<article\b[^>]*>\s*<a href="\/proyectos\/441\/"[\s\S]*?<\/article>/)?.[0];
          const header = detail.html.match(/<article\b[^>]*>\s*<header\b[\s\S]*?<\/header>/)?.[0];
          assert.ok(card);
          assert.ok(header);
          for (const html of [card, header]) {
            assert.doesNotMatch(html, /unknown-category|Categoría| · /);
            if (year) assert.match(html, /2026/);
            else assert.doesNotMatch(html, /<dl\b|<p\b|2026/);
          }
        }
      } finally {
        pilot = structuredClone(pilotProject);
      }
    });
    await t.test('null-language Spanish text and detail metadata match', async () => {
      const { html } = await request('/proyectos/441/');
      assert.match(html, /<h1\b[^>]*>Test 4<\/h1>/);
      assert.match(html, /<title>Test 4 \| e estudio<\/title>/);
      assert.ok(html.includes(`<meta name="description" content="${paragraphs.join('\n\n')}"`));
      assert.doesNotMatch(html, /Contenido en español pendiente/);
    });
    await t.test('partial Spanish translation uses the whole original in cards, detail and metadata', async () => {
      pilot = { ...pilotProject, translations: [{ language: 'es', title: 'Título aprobado', description: null }] };
      const translatedList = await request('/proyectos/');
      const translatedDetail = await request('/proyectos/441/');
      for (const { html } of [translatedList, translatedDetail]) {
        assert.match(html, /Test 4/);
        assert.doesNotMatch(html, /Título aprobado/);
      }
      assert.match(translatedDetail.html, /<title>Test 4 \| e estudio<\/title>/);
      assert.ok(translatedDetail.html.includes(`<meta name="description" content="${paragraphs.join('\n\n')}"`));
      pilot = structuredClone(pilotProject);
    });
    await t.test('untranslated English uses original content and absent media use placeholders', async () => {
      const { html } = await request('/proyectos/2/');
      assert.match(html, /Not Spanish/);
      assert.match(html, /Must not leak/);
      assert.match(html, /Imagen pendiente/);
      assert.doesNotMatch(html, /Contenido en español pendiente/);
    });
    await t.test('description remains escaped with line breaks and no invented content', async () => {
      pilot = { ...pilotProject, description: '<script>alert(1)</script>\nSecond line\n\nLast paragraph', images: [] };
      const { html } = await request('/proyectos/441/');
      assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
      assert.match(html, /Second line/);
      assert.match(html, /Last paragraph/);
      // Angle brackets inside a quoted meta attribute are inert; inspect rendered body text.
      const body = html.split('</head>')[1];
      assert.doesNotMatch(body, /<script>alert\(1\)<\/script>/);
      assert.match(body, /Second line<\/p>\s*<p\b[^>]*>Last paragraph<\/p>/);
      assert.match(html, /Imagen pendiente/);
      pilot = structuredClone(pilotProject);
    });
    version = 2;
    assert.match((await request('/proyectos/1/')).html, /Casa &lt;script&gt; v2/);
    assert.equal((await request('/proyectos/999/')).status, 404);
    const beforeInvalid = calls;
    assert.equal((await request('/proyectos/not-an-id/')).status, 404);
    assert.equal(calls, beforeInvalid, 'Invalid IDs must not call upstream');
    version = 3;
    for (const path of ['/proyectos/', '/proyectos/1/']) {
      const failure = await request(path);
      assert.equal(failure.status, 503);
      assert.doesNotMatch(failure.html, /private-database-detail/);
    }
    version = 4;
    const empty = await request('/proyectos/');
    assert.equal(empty.status, 200);
    assert.match(empty.html, /Todavía no hay proyectos disponibles/);
    assert.equal((await request('/proyectos/1/')).status, 404);
  } finally {
    globalThis.fetch = nativeFetch;
    delete process.env.MOCKLAB_PROJECTS_URL;
    delete process.env.MOCKLAB_USER_ID;
  }
});

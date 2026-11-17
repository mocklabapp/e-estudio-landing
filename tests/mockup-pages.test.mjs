// @ts-check
// Home, Studio, Projects list and Services alignment with the November 2026 client mockups (S16-S19).
// Static pages are read from the generated `dist/client`; SSR pages come from the built handler with
// no upstream configured, which still renders the shared shell, headings and closing band (HTTP 503).
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
/** @param {string} route */
const staticPage = (route) => readFile(new URL(`dist/client/${route}index.html`, pathToFileURL(root)), 'utf8');

/** @param {string} path */
async function ssrPage(path) {
  delete process.env.MOCKLAB_PROJECTS_URL;
  delete process.env.MOCKLAB_USER_ID;
  const module = await import(pathToFileURL(`${root}.vercel/output/_functions/entry.mjs`).href);
  /** @type {unknown} */
  const handler = module.default;
  assert.ok(handler && typeof handler === 'object' && 'fetch' in handler);
  if (typeof handler.fetch !== 'function') throw new Error('Missing built fetch handler');
  /** @type {unknown} */
  const response = await handler.fetch(new Request(`https://example.test${path}`));
  assert.ok(response instanceof Response);
  return response.text();
}

const [studio, studioCa, services, servicesCa, home, homeCa, projects, projectsCa] = await Promise.all([
  staticPage('estudio/'), staticPage('ca/estudi/'), staticPage('servicios/'), staticPage('ca/serveis/'),
  ssrPage('/'), ssrPage('/ca/'), ssrPage('/proyectos/'), ssrPage('/ca/projectes/'),
]);

/** @param {string} html */
function text(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&#39;|&#x27;/g, '’').replace(/\s+/g, ' ').trim();
}

/** Text of every eyebrow/title carrying the shared short rule. @param {string} html */
function ruled(html) {
  return [...html.matchAll(/<(h[1-3]|p)\b[^>]*class="[^"]*\btitle-rule\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/g)]
    .map(([, , content]) => text(content));
}

/** The closing band, identified by its tinted surface background. @param {string} html */
function band(html) {
  const match = html.match(/<section\b[^>]*\bbg-surface\b[^>]*>([\s\S]*?)<\/section>/g);
  assert.ok(match, 'Missing tinted closing band');
  return match.at(-1) ?? '';
}

/** Fragments of the band heading rendered in the accent colour. @param {string} html */
function accents(html) {
  const heading = band(html).match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? '';
  return [...heading.matchAll(/<span\b[^>]*\btext-brand\b[^>]*>([\s\S]*?)<\/span>/g)].map(([, s]) => text(s));
}

/** @param {string} html */
const bandHeading = (html) => text(band(html).match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? '');

/** @param {string} html @param {string} href @param {string} label */
function hasLink(html, href, label) {
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.ok(links.some(([, target, content]) => target === href && text(content).includes(label)),
    `Missing ${label} link to ${href}`);
}

test('S16 Home hero keeps the sans identity with the whole accent line and the studio link', () => {
  assert.match(home, /<h1>e estudio<\/h1>/);
  assert.match(home, /<p>espacios pensados para vivir\.<\/p>/);
  assert.match(home, /<div[^>]*\btext-brand\b[^>]*>\s*<p>espacios pensados para vivir\.<\/p>/);
  hasLink(home, '/estudio/', 'Conocer el estudio');
  hasLink(homeCa, '/ca/estudi/', 'Coneix l’estudi');
});

test('S16 Home cards carry ruled eyebrows and a fine vertical separator', () => {
  for (const [html, expected] of /** @type {const} */ ([
    [home, ['Nuestra arquitectura', 'Living Research', 'Proyectos destacados', 'Empezamos a hablar']],
    [homeCa, ['La nostra arquitectura', 'Living Research', 'Projectes destacats', 'Comencem a parlar']],
  ])) {
    const rules = ruled(html);
    for (const label of expected) assert.ok(rules.includes(label), `Missing rule under ${label}`);
    const cards = html.match(/<section\b[^>]*aria-label="Arquitectura[^"]*"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
    assert.match(cards, /md:border-l/, 'Missing vertical line between the two cards');
  }
  hasLink(home, '/servicios/', 'Ver servicios');
  hasLink(home, '/living-research/', 'Descubrir Living Research');
  hasLink(homeCa, '/ca/serveis/', 'Veure els serveis');
  hasLink(homeCa, '/ca/living-research/', 'Descobreix Living Research');
});

test('S16 Home closing band accents only «conversación.»', () => {
  assert.deepEqual(accents(home), ['conversación.']);
  assert.equal(bandHeading(home), 'Habitar empieza con una conversación.');
  assert.deepEqual(accents(homeCa), ['conversa.']);
  assert.equal(bandHeading(homeCa), 'Habitar comença amb una conversa.');
  hasLink(band(home), '/contacto/', 'Contacto');
  hasLink(band(homeCa), '/ca/contacte/', 'Contacte');
});

test('S17 Studio uses «Equipo», ruled eyebrows, principle titles and founders heading', () => {
  for (const [html, labels] of /** @type {const} */ ([
    [studio, ['El estudio', 'Nuestra filosofía', 'Espacio', 'Esencia', 'Equilibrio', 'Nosotras',
      'Dos trayectorias complementarias.', 'Equipo', 'Clientes y colaboradores', 'Nuestro estudio']],
    [studioCa, ['L’estudi', 'La nostra filosofia', 'Espai', 'Essència', 'Equilibri', 'Nosaltres',
      'Dues trajectòries complementàries.', 'Equip', 'Clients i col·laboradors', 'El nostre estudi']],
  ])) {
    const rules = ruled(html);
    for (const label of labels) assert.ok(rules.includes(label), `Missing rule under ${label}`);
    assert.doesNotMatch(html, /hero-rule/);
  }
  assert.doesNotMatch(text(studio), /El equipo/);
  assert.doesNotMatch(text(studioCa), /L’equip/);
});

test('S18 Projects list has a ruled sans title and the accented closing band', () => {
  for (const [html, title, eyebrow, accent, contact] of /** @type {const} */ ([
    [projects, 'Proyectos', '¿Hablamos?', 'una forma de habitar.', '/contacto/'],
    [projectsCa, 'Projectes', 'En parlem?', 'una manera d’habitar.', '/ca/contacte/'],
  ])) {
    assert.match(html, /<h1\b[^>]*class="[^"]*\btitle-rule\b/);
    assert.ok(ruled(html).includes(title));
    assert.ok(ruled(html).includes(eyebrow), `Missing rule under ${eyebrow}`);
    assert.deepEqual(accents(html), [accent]);
    hasLink(band(html), contact, title === 'Proyectos' ? 'Contacto' : 'Contacte');
  }
  assert.equal(bandHeading(projects), 'Cada proyecto, una forma de habitar.');
  assert.equal(bandHeading(projectsCa), 'Cada projecte, una manera d’habitar.');
});

test('S19 Services has ruled title and offers, and honest contact destinations', () => {
  for (const [html, labels, contact] of /** @type {const} */ ([
    [services, ['Servicios', 'habitar', 'promover', '¿Hablamos?'], '/contacto/'],
    [servicesCa, ['Serveis', 'habitar', 'promoure', 'En parlem?'], '/ca/contacte/'],
  ])) {
    const rules = ruled(html);
    for (const label of labels) assert.ok(rules.includes(label), `Missing rule under ${label}`);
    for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]*)"/g)) {
      assert.ok(!href.startsWith('http') || href.includes('instagram'), `Invented destination ${href}`);
    }
    hasLink(html, contact, html === services ? 'Preguntar por e living' : 'Pregunta per e living');
  }
});

test('S19 Services closing band accents only «Vivir» at the start of the line', () => {
  assert.deepEqual(accents(services), ['Vivir']);
  assert.equal(bandHeading(services), 'Vivir es una elección.');
  assert.match(band(services), /<span[^>]*\btext-brand\b[^>]*>Vivir<\/span>\s*es una elección\./);
  assert.deepEqual(accents(servicesCa), ['Viure']);
  assert.equal(bandHeading(servicesCa), 'Viure és una elecció.');
  hasLink(band(services), '/contacto/', 'Contacto');
  hasLink(band(servicesCa), '/ca/contacte/', 'Contacte');
});

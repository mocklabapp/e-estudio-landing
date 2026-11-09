// @ts-check
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { fixture } from './helpers/build-fixture.mjs';

const entries = ['Home', 'Studio', 'Services', 'Research'];
const build = await fixture(async ({ root }) => {
  for (const entry of entries) {
    await writeFile(join(root, `src/pages/editorial-fixture-${entry.toLowerCase()}.astro`), `---
import Page from '@/components/editorial/${entry}Page.astro';
import '@/styles/global.css';
---
<!doctype html><html lang="es"><head><title>Editorial fixture</title></head><body>
<Page ${entry === 'Home' ? 'title="e estudio" description="espacios pensados para vivir."' : ''} />
</body></html>`);
  }
  await writeFile(join(root, 'src/pages/editorial-fixture-props.astro'), `---
import HomePage from '@/components/editorial/HomePage.astro';
---
<HomePage title={'Otra identidad & <estudio>'} description={'Otra descripción & <hogar>'} />`);
});
assert.equal(build.status, 0, build.output);

const [home, studio, services, research] = await Promise.all(entries.map(
  (entry) => build.html(`editorial-fixture-${entry.toLowerCase()}/index.html`),
));

/** @param {string} html */
function text(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** @param {string} html @param {string} href @param {string} label */
function hasLink(html, href, label) {
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.ok(links.some(([, target, content]) => target === href && text(content).includes(label)),
    `Missing ${label} link to ${href}`);
}

/** @param {string} html @param {string} label */
function section(html, label) {
  const match = html.match(new RegExp(
    `<section\\b[^>]*aria-labelledby="${label}"[^>]*>([\\s\\S]*?)<\\/section>`,
  ));
  assert.ok(match, `Missing section labelled by ${label}`);
  return match[1];
}

test('home preserves metadata copy and provides editorial and portfolio navigation', () => {
  assert.match(home, /<h1>e estudio<\/h1>/);
  assert.match(home, /<p>espacios pensados para vivir\.<\/p>/);
  for (const phrase of ['Nuestra arquitectura', 'Living Research',
    'Proyectamos espacios para ser habitados.', 'Investigamos nuevas formas de habitar.']) {
    assert.ok(text(home).includes(phrase), `Missing ${phrase}`);
  }
  hasLink(home, '/estudio/', 'Conocer el estudio');
  hasLink(home, '/living-research/', 'Living Research');
  hasLink(home, '/proyectos/', 'proyectos');
  assert.doesNotMatch(home, /data-project-id|\/api\/projects/);
});

test('home presents an honest empty featured section with a portfolio link', () => {
  const portfolio = section(home, 'home-projects');
  assert.match(text(portfolio), /Proyectos destacados/);
  assert.match(text(portfolio), /Todavía no hay proyectos disponibles/);
  hasLink(portfolio, '/proyectos/', 'Ver todos los proyectos');
  assert.doesNotMatch(portfolio, /Imagen pendiente|<article\b/);
});

test('home delivers the two approved editorial crops with their native dimensions', async () => {
  const images = [...home.matchAll(/<img\b[^>]*>/g)].map(([image]) => image);
  assert.equal(images.length, 2);
  for (const [index, [name, width]] of /** @type {Array<[string, number]>} */ ([
    ['architecture', 436], ['living-research', 437],
  ]).entries()) {
    assert.ok(images[index].includes(`src="/home/${name}.png"`));
    assert.ok(images[index].includes(`width="${width}"`));
    assert.match(images[index], /height="282"/);
    assert.match(images[index], /alt="[^"]+"/);
    const bytes = await readFile(join(build.root, `dist/client/home/${name}.png`));
    assert.equal(bytes.readUInt32BE(16), width);
    assert.equal(bytes.readUInt32BE(20), 282);
  }
  hasLink(home, '/servicios/', 'Ver servicios');
  hasLink(home, '/living-research/', 'Descubrir Living Research');
  assert.ok(text(home).includes('Empezamos a hablar'));
  assert.ok(text(home).includes('Habitar empieza con una conversación.'));
});

test('studio presents approved philosophy, team portraits and collaborator artwork', () => {
  assert.ok(text(studio).includes('Creamos espacios, investigamos nuevas formas de habitar.'));
  for (const phrase of ['Espacio', 'El lugar y su contexto.', 'Esencia', 'Lo que realmente importa.',
    'Equilibrio', 'Entre la vida de hoy y la de mañana.', 'Dos trayectorias complementarias.',
    'Una misma manera de entender la arquitectura.', 'Un lugar abierto a la conversación.']) {
    assert.ok(text(studio).includes(phrase), `Missing ${phrase}`);
  }
  const people = [...studio.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, item]) => text(item));
  for (const [name, role] of [['Eva', 'Arquitecta'], ['Esther', 'Arquitecta'], ['Ana', 'Arquitecta'],
    ['Pep Comermà', 'Arquitecto'], ['Raúl', 'Arquitecto'], ['Andrea', 'Estructuras']]) {
    assert.ok(people.some((item) => item.includes(name) && item.includes(role)), `Missing ${name}: ${role}`);
    assert.ok(studio.includes(`alt="Retrato de ${name}"`));
  }
  for (const name of ['Generalitat de Catalunya', 'INCASÒL', 'Ajuntament de Barcelona', 'COPCISA', 'COAC']) {
    assert.ok(studio.includes(`alt="${name}"`), `Missing collaborator ${name}`);
  }
  assert.doesNotMatch(studio, /Imagen pendiente|Logotipos pendientes/);
  assert.ok(text(studio).includes('Nosotras'));
  assert.ok(text(studio).includes('Nuestra filosofía'));
  assert.ok(text(studio).includes('Nuestro estudio'));
});

test('services publishes supplied offers without fabricating external destinations', () => {
  for (const phrase of ['Servicios', 'habitar', 'promover',
    'Para quienes quieren construir o transformar su hogar.',
    'Obra nueva', 'Rehabilitación', 'Ampliaciones y reformas',
    'Para quienes quieren desarrollar proyectos residenciales.',
    '¿Buscas una vivienda terminada?', 'Descubre e living, nuestra propuesta inmobiliaria.',
    'Vivir es una elección.']) {
    assert.ok(text(services).includes(phrase), `Missing ${phrase}`);
  }
  hasLink(services, '/contacto/', 'Preguntar por e living');
  assert.doesNotMatch(services, /href="https?:/);
});

test('each service starts with media before its offer and e living remains a separate promotion', () => {
  for (const [id, name] of [['service-inhabit', 'habitar'], ['service-develop', 'promover']]) {
    const card = section(services, id);
    const image = card.match(/<img\b[^>]*>/)?.[0];
    assert.ok(image, `Missing ${name} photograph`);
    assert.ok(image.includes(`src="/services/${name}.png"`));
    assert.match(image, /alt="[^"]+"/);
    assert.ok(card.indexOf(image) < card.indexOf('<h2'), 'Photograph must precede the offer');
  }
  const living = section(services, 'services-living');
  assert.match(living, /aria-label="e living"/);
  assert.doesNotMatch(living, /role="img"/);
  hasLink(living, '/contacto/', 'Preguntar por e living');
});

test('research is an editorial page with models, exact questions and a five-step method', () => {
  for (const phrase of ['La forma de habitar está cambiando.', 'Vivimos más años.',
    'Cohousing', 'Coliving', 'Comunidades intergeneracionales', 'Otras formas de habitar',
    'Preguntar', 'Conversar', 'Investigar', 'Explorar', 'Hacer posible',
    'Cada investigación nace de una pregunta abierta y se construye en común.']) {
    assert.ok(text(research).includes(phrase), `Missing ${phrase}`);
  }
  const questions = [...research.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)]
    .map(([, heading]) => text(heading)).filter((heading) => heading.includes('¿'));
  assert.deepEqual(questions, [
    '¿Cómo queremos vivir cuando seamos mayores?',
    '¿Cómo vivirán nuestros hijos?',
    '¿Qué posibilidades ofrecen los espacios que ya tenemos?',
  ]);
  const method = section(research, 'research-method');
  assert.ok(text(method).includes('De la conversación a la realidad.'));
  assert.doesNotMatch(research, /<time\b|inscrib|votaci|participa|evento confirmado/i);
});

test('research discovery pairs each housing model with media before its label', () => {
  const models = section(research, 'research-models');
  assert.ok(text(models).includes('Descubrir'));
  assert.ok(text(models).includes('¿Conoces todas las formas en las que podemos vivir?'));
  const cards = [...models.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, card]) => card);
  assert.equal(cards.length, 4);
  const labels = ['Cohousing', 'Coliving', 'Comunidades intergeneracionales', 'Otras formas de habitar'];
  for (const [index, card] of cards.entries()) {
    assert.ok(card.indexOf('<img ') >= 0 && card.indexOf('<img ') < card.indexOf('<h3'),
      'A supplied photograph must precede the model label');
    const heading = card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/);
    assert.ok(heading);
    assert.equal(text(heading[1]), labels[index]);
    assert.match(card, new RegExp(`src="/living-research/${[
      'cohousing', 'coliving', 'intergenerational-community', 'other-living-models',
    ][index]}\\.png"`));
  }
});

test('all entries remain passive content with one heading and contact navigation', () => {
  for (const html of [home, studio, services, research]) {
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.doesNotMatch(html, /<(?:main|header|footer|form|input|button|script)\b/);
    hasLink(html, '/contacto/', 'Contacto');
    assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)\.com/);
    if (html === services) {
      const sources = [...html.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(([, src]) => src);
      const photographs = sources.filter((src) => !src.startsWith('/brand/'));
      assert.deepEqual(photographs, ['/services/habitar.png', '/services/promover.png']);
      assert.doesNotMatch(html, /Imagen pendiente/);
    } else if (html === home) {
      assert.doesNotMatch(html, /Imagen pendiente/);
      assert.equal([...html.matchAll(/<img\b/g)].length, 2);
    }
  }
});

test('studio delivers all thirteen supplied crops in order with native dimensions', async () => {
  /** @type {Array<[string, number, number]>} */
  const expected = [
    ['photos/founders-working', 584, 268],
    ['photos/headshot-eva', 120, 96], ['photos/headshot-esther', 128, 96],
    ['photos/headshot-ana', 127, 96], ['photos/headshot-pep-comerma', 128, 96],
    ['photos/headshot-raul', 127, 96], ['photos/headshot-andrea', 122, 96],
    ['client-logos/generalitat-de-catalunya', 119, 35], ['client-logos/incasol', 114, 44],
    ['client-logos/ajuntament-de-barcelona', 125, 47], ['client-logos/copcisa', 121, 32],
    ['client-logos/coac', 121, 45], ['photos/studio-meeting-room', 620, 212],
  ];
  const images = [...studio.matchAll(/<img\b[^>]*>/g)].map(([image]) => image);
  assert.equal(images.length, expected.length);
  for (const [index, [name, width, height]] of expected.entries()) {
    const image = images[index];
    const src = `/studio/${name}.png`;
    assert.ok(image.includes(`src="${src}"`), `Missing ordered image ${src}`);
    assert.ok(image.includes(`width="${width}"`) && image.includes(`height="${height}"`));
    assert.match(image, /alt="[^"]+"/);
    assert.ok(image.includes(`loading="${index === 0 ? 'eager' : 'lazy'}"`));
    const bytes = await readFile(join(build.root, 'dist/client', src));
    assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), width);
    assert.equal(bytes.readUInt32BE(20), height);
  }
  assert.match(section(studio, 'studio-founders'), /founders-working\.png/);
  assert.equal([...section(studio, 'studio-team').matchAll(/<img\b/g)].length, 6);
  assert.equal([...section(studio, 'studio-collaborators').matchAll(/<img\b/g)].length, 5);
  assert.match(section(studio, 'studio-space'), /studio-meeting-room\.png/);
  hasLink(section(studio, 'studio-contact'), '/contacto/', 'Contacto');
});

test('research serves eleven clean native photographs with truthful dimensions and loading', async () => {
  const expected = [
    ['hero-photo-clean-crop', 343, 328],
    ['cohousing', 164, 145], ['coliving', 165, 145],
    ['intergenerational-community', 165, 145], ['other-living-models', 165, 145],
    ['research-older-man-landscape', 210, 105], ['research-young-man-city', 213, 105],
    ['research-house', 208, 105], ['meeting-banner', 743, 90],
    ['outdoor-community', 347, 177], ['sunset-clean-detail-crop', 280, 199],
  ];
  const images = [...research.matchAll(/<img\b[^>]*>/g)].map(([image]) => image);
  assert.equal(images.length, expected.length);
  for (const [index, [name, width, height]] of expected.entries()) {
    const image = images[index];
    const src = `/living-research/${name}.png`;
    assert.ok(image.includes(`src="${src}"`), `Missing ordered photo ${src}`);
    assert.ok(image.includes(`width="${width}"`) && image.includes(`height="${height}"`));
    assert.match(image, /alt="[^"]+"/);
    assert.ok(image.includes(`loading="${index === 0 ? 'eager' : 'lazy'}"`));
    const bytes = await readFile(join(build.root, 'dist/client', src));
    assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), width);
    assert.equal(bytes.readUInt32BE(20), height);
  }
  assert.doesNotMatch(research, /Imagen pendiente|with-overlay|<time\b|inscrib|votaci|participa|registro/i);
});

test('research keeps questions, method, community and sunset contact in editorial order', () => {
  const questions = section(research, 'research-questions');
  assert.equal([...questions.matchAll(/<img\b/g)].length, 3);
  const method = section(research, 'research-method');
  const steps = [...method.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map(([, h]) => text(h));
  assert.deepEqual(steps, ['Preguntar', 'Conversar', 'Investigar', 'Explorar', 'Hacer posible']);
  const community = section(research, 'research-community');
  assert.match(community, /outdoor-community\.png/);
  assert.ok(text(community).includes('Arquitectura, personas y conocimiento'));
  const closing = section(research, 'research-contact');
  assert.match(closing, /sunset-clean-detail-crop\.png/);
  hasLink(closing, '/contacto/', 'Contacto');
  assert.ok(research.indexOf('meeting-banner.png') < research.indexOf('id="research-method"'));
  assert.ok(research.indexOf('id="research-method"') < research.indexOf('outdoor-community.png'));
  assert.ok(research.indexOf('outdoor-community.png') < research.indexOf('sunset-clean-detail-crop.png'));
});

test('editorial links use approved routes or existing local anchors', () => {
  const routes = ['/', '/estudio/', '/proyectos/', '/servicios/', '/living-research/', '/contacto/'];
  for (const html of [home, studio, services, research]) {
    for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]*)"/g)) {
      if (href.startsWith('#')) {
        assert.notEqual(href, '#');
        assert.ok(html.includes(`id="${href.slice(1)}"`), `Missing anchor ${href}`);
      } else {
        assert.ok(routes.includes(href), `Unapproved destination ${href}`);
      }
    }
  }
});

test('home renders alternate supplied title and description safely without hardcoded identity', async () => {
  const html = await build.html('editorial-fixture-props/index.html');
  assert.match(html, /<h1>Otra identidad &amp; &lt;estudio&gt;<\/h1>/);
  assert.match(html, /<p>Otra descripción &amp; &lt;hogar&gt;<\/p>/);
  assert.doesNotMatch(html, /<estudio>|<hogar>/);
});

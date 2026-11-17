// @ts-check
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { enhanceInterestPreview, simulateInterestPreview } from '../src/lib/interest-form.ts';

// Generated HTML from `astro build`, as served for the real ES and CA routes.
const dist = new URL('../dist/client/', import.meta.url);
const [es, ca] = await Promise.all(['living-research', 'ca/living-research']
  .map((route) => readFile(new URL(`${route}/index.html`, dist), 'utf8')));

/** @param {string} html */
function text(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&#39;|&#x27;/g, '’').replace(/\s+/g, ' ').trim();
}

/** @param {string} html @param {string} label */
function section(html, label) {
  const match = html.match(new RegExp(
    `<section\\b[^>]*aria-labelledby="${label}"[^>]*>([\\s\\S]*?)<\\/section>`,
  ));
  assert.ok(match, `Missing section labelled by ${label}`);
  return match[1];
}

/** @param {string} html @param {string} tag */
function headings(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map(([, h]) => text(h));
}

/** @param {string} html @param {string} href @param {string} label */
function hasLink(html, href, label) {
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.ok(links.some(([, target, content]) => target === href && text(content).includes(label)),
    `Missing ${label} link to ${href}`);
}

const copy = {
  es: {
    html: es, contact: '/contacto/', h1: 'La forma de habitar está cambiando.',
    models: ['Cohousing', 'Coliving', 'Comunidades intergeneracionales', 'Otras formas de habitar'],
    discover: '¿Conoces todas las formas en las que podemos vivir?',
    together: 'Investiguemos juntos', old: 'Preguntas abiertas',
    questions: ['¿Cómo queremos vivir cuando seamos mayores?', '¿Cómo vivirán nuestros hijos?',
      '¿Qué posibilidades ofrecen los espacios que ya tenemos?'],
    method: 'De la conversación a la realidad.',
    steps: ['Preguntar', 'Conversar', 'Investigar', 'Explorar', 'Hacer posible'],
    community: '¿Quieres formar parte de Living Research?', formTitle: 'Cuéntanos qué te interesa',
    labels: ['Nombre', 'Email', 'Mensaje'], notice: 'Formulario de demostración. No se envían ni guardan datos.',
    closing: 'Repensar la vivienda es también repensar cómo queremos vivir.',
    cta: '¿Cómo te gustaría vivir?', contactLabel: 'Contacto', vote: /Votar|votaci/i,
  },
  ca: {
    html: ca, contact: '/ca/contacte/', h1: 'La manera d’habitar està canviant.',
    models: ['Cohousing', 'Coliving', 'Comunitats intergeneracionals', 'Altres maneres d’habitar'],
    discover: 'Coneixes totes les maneres com podem viure?',
    together: 'Investiguem junts', old: 'Preguntes obertes',
    questions: ['Com volem viure quan siguem grans?', 'Com viuran els nostres fills?',
      'Quines possibilitats ofereixen els espais que ja tenim?'],
    method: 'De la conversa a la realitat.',
    steps: ['Preguntar', 'Conversar', 'Investigar', 'Explorar', 'Fer possible'],
    community: 'Vols formar part de Living Research?', formTitle: 'Explica’ns què t’interessa',
    labels: ['Nom', 'Correu electrònic', 'Missatge'],
    notice: 'Formulari de demostració. No s’envien ni es guarden dades.',
    closing: 'Repensar l’habitatge és també repensar com volem viure.',
    cta: 'Com t’agradaria viure?', contactLabel: 'Contacte', vote: /Votar|votaci[óo]/i,
  },
};

for (const [locale, c] of Object.entries(copy)) {
  const html = c.html;
  const spanishOnly = locale === 'ca' ? [
    'Investiguemos juntos', 'Cuéntanos qué te interesa', 'Repensar la vivienda', '¿Cómo te gustaría vivir?',
    '¿Quieres formar parte', 'Preguntas abiertas', 'Descubrir', 'Qué es',
  ] : [];

  test(`${locale}: hero keeps eyebrow, heading and intro with a full-width photo and no button`, () => {
    const hero = section(html, 'research-hero');
    assert.ok(text(hero).includes('Living Research'));
    assert.deepEqual(headings(html, 'h1'), [c.h1]);
    assert.match(text(hero), locale === 'es' ? /Vivimos más años\./ : /Vivim més anys\./);
    const photo = hero.match(/<img\b[^>]*>/)?.[0] ?? '';
    assert.match(photo, /src="\/living-research\/hero-photo-clean-crop\.png"/);
    assert.match(photo, /class="[^"]*\bw-full\b[^"]*\bobject-cover\b/, 'Photo spans the band and covers it');
    assert.doesNotMatch(hero, /<(?:a|button)\b|Conoce el proyecto|Coneix el projecte/);
    assert.ok(!text(hero).includes(c.closing), 'The closing phrase does not belong in the hero');
    assert.doesNotMatch(hero, /Repensar/);
  });

  test(`${locale}: discover lists four models, each with a native details explanation`, () => {
    const models = section(html, 'research-models');
    assert.ok(text(models).includes(c.discover));
    const cards = [...models.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, card]) => card);
    assert.equal(cards.length, 4);
    for (const [index, card] of cards.entries()) {
      assert.equal(headings(card, 'h3')[0], c.models[index]);
      const details = card.match(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/);
      assert.ok(details, `Missing details for ${c.models[index]}`);
      assert.ok(text(details[1]).includes(c.models[index]), 'Summary has an accessible model name');
      assert.ok(text(details[2]).length > 40, 'Explanation has content');
      assert.doesNotMatch(details[2], /e estudio/i, 'Definitions make no claims about the studio');
      assert.doesNotMatch(card, /<(?:script|a|button)\b/);
      assert.ok(card.indexOf('<img ') >= 0 && card.indexOf('<img ') < card.indexOf('<h3'));
    }
  });

  test(`${locale}: Investiguemos juntos replaces open questions with LR01-LR03 and no invented data`, () => {
    assert.ok(!html.includes(c.old), `${c.old} must be gone`);
    assert.ok(!/Este año queremos conversar|Aquest any volem conversar/.test(html));
    const questions = section(html, 'research-questions');
    assert.deepEqual(headings(questions, 'h2'), [c.together]);
    const cards = [...questions.matchAll(/<div>([\s\S]*?<h3[\s\S]*?<\/h3>)\s*<\/div>/g)].map(([, card]) => card);
    assert.equal(cards.length, 3);
    for (const [index, card] of cards.entries()) {
      assert.ok(text(card).startsWith(`LR0${index + 1}`), `LR0${index + 1} prefixes the question`);
      assert.equal(headings(card, 'h3')[0], c.questions[index]);
      assert.match(card, /<img\b[^>]*src="\/living-research\//);
    }
    assert.doesNotMatch(questions, /<time\b|<a\b|\b20\d\d\b/);
  });

  test(`${locale}: method, community call to action and participate anchor stay connected`, () => {
    const method = section(html, 'research-method');
    assert.ok(text(method).includes(c.method));
    assert.deepEqual(headings(method, 'h3'), c.steps);
    const community = section(html, 'research-community');
    assert.deepEqual(headings(community, 'h2'), [c.community]);
    assert.match(community, /outdoor-community\.png/);
    hasLink(community, '#research-participate', c.formTitle);
    assert.match(html, /<section\b[^>]*id="research-participate"/);
    assert.ok(html.indexOf('id="research-community"') < html.indexOf('id="research-participate"'));
  });

  test(`${locale}: participate form is a labelled no-send demo without voting`, () => {
    const participate = section(html, 'research-participate-title');
    assert.deepEqual(headings(participate, 'h2'), [c.formTitle]);
    assert.ok(text(participate).includes(c.notice));
    for (const [index, id] of ['name', 'email', 'message'].entries()) {
      assert.match(participate, new RegExp(`<label[^>]*for="interest-${id}"[^>]*>\\s*${c.labels[index]}\\s*</label>`));
      assert.match(participate, new RegExp(`<(?:input|textarea)[^>]*id="interest-${id}"[^>]*required`));
    }
    assert.match(participate, /<input[^>]*id="interest-email"[^>]*type="email"|<input[^>]*type="email"[^>]*id="interest-email"/);
    assert.match(participate, /<button[^>]*id="interest-simulate"[^>]*type="button"[^>]*disabled/);
    assert.match(participate, /role="status"[^>]*aria-live="polite"/);
    assert.match(participate, /<noscript>[\s\S]*JavaScript[\s\S]*<\/noscript>/);
    assert.equal([...participate.matchAll(/<(?:input|textarea|select)\b/g)].length, 3);
    assert.doesNotMatch(html, /<form\b|\baction=|\bmethod=|type="checkbox"|type="radio"/i);
    assert.doesNotMatch(text(html), c.vote);
    assert.doesNotMatch(participate, /\bname=/);
  });

  test(`${locale}: closing band holds the sunset, phrase, CTA and Contact before the separate footer`, () => {
    const closing = section(html, 'research-contact');
    assert.deepEqual(headings(closing, 'h2'), [c.closing]);
    assert.ok(text(closing).includes(c.cta));
    assert.match(closing, /sunset-clean-detail-crop\.png/);
    hasLink(closing, c.contact, c.contactLabel);
    assert.equal(text(html).split(c.closing).length - 1, 1, 'The phrase appears only once, in the closing');
    const footer = html.indexOf('<footer');
    assert.ok(footer > html.indexOf('id="research-contact"'), 'Footer follows the closing band');
    assert.ok(html.lastIndexOf('</section>', footer) > html.indexOf('id="research-contact"'));
    assert.ok(!closing.includes('<footer'));
  });

  test(`${locale}: complete copy with no untranslated new strings`, () => {
    for (const phrase of spanishOnly) {
      assert.ok(!text(html).includes(phrase), `Untranslated: ${phrase}`);
    }
  });
}

test('research keeps its eleven native photographs in editorial order with truthful dimensions', async () => {
  const expected = [
    ['hero-photo-clean-crop', 343, 328],
    ['cohousing', 164, 145], ['coliving', 165, 145],
    ['intergenerational-community', 165, 145], ['other-living-models', 165, 145],
    ['research-older-man-landscape', 210, 105], ['research-young-man-city', 213, 105],
    ['research-house', 208, 105], ['meeting-banner', 743, 90],
    ['outdoor-community', 347, 177], ['sunset-clean-detail-crop', 280, 199],
  ];
  for (const html of [es, ca]) {
    const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([image]) => image)
      .filter((image) => image.includes('/living-research/'));
    assert.equal(images.length, expected.length);
    for (const [index, [name, width, height]] of expected.entries()) {
      const image = images[index];
      assert.ok(image.includes(`src="/living-research/${name}.png"`), `Missing ordered photo ${name}`);
      assert.ok(image.includes(`width="${width}"`) && image.includes(`height="${height}"`));
      assert.match(image, /alt="[^"]+"/);
      assert.ok(image.includes(`loading="${index === 0 ? 'eager' : 'lazy'}"`));
    }
  }
  for (const [name, width, height] of expected) {
    const bytes = await readFile(new URL(`living-research/${name}.png`, dist));
    assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), width);
    assert.equal(bytes.readUInt32BE(20), height);
  }
  assert.doesNotMatch(es, /Imagen pendiente|with-overlay|<time\b|inscrib|registro/i);
});

test('the interest form script contains no network, storage or navigation', async () => {
  const entry = es.match(/<script\b[^>]*type="module"[^>]*src="(\/_astro\/ResearchParticipate[^"]+\.js)"/)?.[1];
  assert.ok(entry, 'The interest form is enhanced by a bundled client script');
  // Follow the entry's relative chunk imports so shared form-preview code is checked too.
  /** @type {string[]} */
  const queue = [entry.slice(1)];
  const seen = new Set();
  for (const file of queue) {
    if (seen.has(file)) continue;
    seen.add(file);
    const code = await readFile(new URL(file, dist), 'utf8');
    assert.doesNotMatch(code, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|\.submit\s*\(|location\s*[.=]|history\./);
    for (const [, chunk] of code.matchAll(/from\s*["']\.\/([^"']+\.js)["']/g)) queue.push(`_astro/${chunk}`);
  }
  assert.ok(seen.size >= 1);
});

test('interest validation requires every field, a valid email and bounded length', () => {
  const valid = { name: 'Prueba', email: 'demo@example.test', message: 'Mensaje de prueba.' };
  assert.equal(simulateInterestPreview(valid).valid, true);
  assert.match(simulateInterestPreview(valid).status, /Simulación completada.*No se ha enviado/);
  const empty = simulateInterestPreview({ name: ' ', email: '', message: '' });
  assert.deepEqual(Object.keys(empty.errors), ['name', 'email', 'message']);
  assert.equal(empty.valid, false);
  assert.ok(simulateInterestPreview({ ...valid, email: 'no-email' }).errors.email);
  assert.ok(simulateInterestPreview({ ...valid, email: '+34 600 000 000' }).errors.email, 'A phone is not an email');
  assert.ok(simulateInterestPreview({ ...valid, message: 'x'.repeat(3001) }).errors.message);
  const catalan = simulateInterestPreview(valid, 'ca');
  assert.match(catalan.status, /Simulació completada.*No s’ha enviat/);
  assert.match(simulateInterestPreview({ ...valid, name: '' }, 'ca').errors.name ?? '', /Completa aquest camp/);
});

/** Minimal DOM surface for the real enhancement; not a browser substitute. */
class Control {
  value = '';
  textContent = '';
  disabled = true;
  validityMessage = '';
  /** @type {Map<string, string>} */ attributes = new Map();
  /** @type {Map<string, (() => void)[]>} */ listeners = new Map();
  /** @param {string} event @param {() => void} listener */
  addEventListener(event, listener) { this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]); }
  /** @param {string} event */
  fire(event) { for (const listener of this.listeners.get(event) ?? []) listener(); }
  /** @param {string} name @param {string} value */
  setAttribute(name, value) { this.attributes.set(name, value); }
  /** @param {string} name */
  removeAttribute(name) { this.attributes.delete(name); }
  /** @param {string} message */
  setCustomValidity(message) { this.validityMessage = message; }
  reportValidity() { return !this.validityMessage; }
  focus() {}
}

test('interest enhancement enables the button, announces results and stays inert otherwise', () => {
  const controls = new Map(['name', 'email', 'message', 'simulate', 'status']
    .map((id) => [`#interest-${id}`, new Control()]));
  /** @param {string} id */
  const control = (id) => /** @type {Control} */ (controls.get(`#interest-${id}`));
  // @ts-expect-error The fake root only implements querySelector.
  enhanceInterestPreview({ querySelector: (selector) => controls.get(selector) ?? null }, 'es');
  assert.equal(control('simulate').disabled, false);
  control('simulate').fire('click');
  assert.match(control('status').textContent, /Revisa/);
  assert.equal(control('name').attributes.get('aria-invalid'), 'true');
  control('name').value = 'Prueba';
  control('email').value = 'demo@example.test';
  control('message').value = 'Hola';
  control('simulate').fire('click');
  assert.match(control('status').textContent, /Simulación completada/);
  control('message').fire('input');
  assert.equal(control('status').textContent, '');
  // @ts-expect-error Missing controls leave the preview inert.
  assert.doesNotThrow(() => enhanceInterestPreview({ querySelector: () => null }, 'es'));
});

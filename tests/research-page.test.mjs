// @ts-check
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

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
    cadence: '2 - 3 encuentros al año para investigar juntos.', join: 'Me interesa participar',
    questions: ['¿Cómo queremos vivir cuando seamos mayores?', '¿Cómo vivirán nuestros hijos?',
      '¿Qué posibilidades ofrecen los espacios que ya tenemos?'],
    descriptions: [
      'Vivimos más años y queremos mantener nuestra autonomía durante más tiempo. ¿Qué necesitamos para seguir viviendo bien?',
      'El acceso a la vivienda está transformando la etapa de la juventud. Queremos investigar qué modelos residenciales pueden responder a esta nueva realidad.',
      'Masías, grandes casas unifamiliares, edificios industriales, hoteles… ¿Podrían albergar nuevas formas de convivencia sin perder su identidad?'],
    meetings: ['Encuentro · otoño 2026', 'Encuentro · invierno 2026', 'Encuentro · primavera 2027'],
    methodEyebrow: 'El método',
    methodIntro: 'Cada investigación nace de una pregunta abierta y se construye en común. La conversación genera conocimiento, y el conocimiento nos acerca a respuestas arquitectónicas que pueden hacerse realidad.',
    method: 'De la conversación a la realidad.',
    steps: ['Preguntar', 'Conversar', 'Investigar', 'Explorar', 'Hacer posible'],
    stepTexts: ['Detectamos una necesidad o un cambio.', 'Reunimos a personas y especialistas.',
      'Analizamos, aprendemos, compartimos.', 'Desarrollamos posibles respuestas arquitectónicas.',
      'Si surge la oportunidad, lo convertimos en un proyecto real.'],
    communityEyebrow: 'La comunidad', communityLink: 'Quiero formar parte',
    communityText: 'Un espacio para conectar personas que comparten inquietudes sobre cómo vivir y quieren explorar nuevas posibilidades. Organizamos encuentros, compartimos investigaciones y detectamos intereses comunes.',
    community: '¿Quieres formar parte de Living Research?', formTitle: 'Cuéntanos qué te interesa',
    formIntro: 'Si tienes un tema o una experiencia que te gustaría compartir, déjanos tu mensaje.',
    message: 'Tu mensaje…', labels: ['Nombre', 'Email', 'Mensaje'], notice: 'Formulario de demostración. No se envían ni guardan datos.',
    closing: 'Repensar la vivienda es también repensar cómo queremos vivir.',
    cta: '¿Cómo te gustaría vivir?', contactLabel: 'Contacto', vote: /Votar|votaci/i,
  },
  ca: {
    html: ca, contact: '/ca/contacte/', h1: 'La manera d’habitar està canviant.',
    models: ['Cohousing', 'Coliving', 'Comunitats intergeneracionals', 'Altres maneres d’habitar'],
    discover: 'Coneixes totes les maneres com podem viure?',
    together: 'Investiguem junts', old: 'Preguntes obertes',
    cadence: '2 - 3 trobades l’any per investigar junts.', join: 'M’interessa participar',
    questions: ['Com volem viure quan siguem grans?', 'Com viuran els nostres fills?',
      'Quines possibilitats ofereixen els espais que ja tenim?'],
    descriptions: [
      'Vivim més anys i volem mantenir la nostra autonomia durant més temps. Què necessitem per continuar vivint bé?',
      'L’accés a l’habitatge està transformant l’etapa de la joventut. Volem investigar quins models residencials poden respondre a aquesta nova realitat.',
      'Masies, grans cases unifamiliars, edificis industrials, hotels… Podrien acollir noves formes de convivència sense perdre la seva identitat?'],
    meetings: ['Trobada · tardor 2026', 'Trobada · hivern 2026', 'Trobada · primavera 2027'],
    methodEyebrow: 'El mètode',
    methodIntro: 'Cada recerca neix d’una pregunta oberta i es construeix en comú. La conversa genera coneixement, i el coneixement ens apropa a respostes arquitectòniques que poden fer-se realitat.',
    method: 'De la conversa a la realitat.',
    steps: ['Preguntar', 'Conversar', 'Investigar', 'Explorar', 'Fer possible'],
    stepTexts: ['Detectem una necessitat o un canvi.', 'Reunim persones i especialistes.',
      'Analitzem, aprenem, compartim.', 'Desenvolupem possibles respostes arquitectòniques.',
      'Si sorgeix l’oportunitat, ho convertim en un projecte real.'],
    communityEyebrow: 'La comunitat', communityLink: 'Vull formar part',
    communityText: 'Un espai per connectar persones que comparteixen inquietuds sobre com viure i volen explorar noves possibilitats. Organitzem trobades, compartim investigacions i detectem interessos comuns.',
    community: 'Vols formar part de Living Research?', formTitle: 'Explica’ns què t’interessa',
    formIntro: 'Si tens un tema o una experiència que t’agradaria compartir, deixa’ns el teu missatge.',
    message: 'El teu missatge…', labels: ['Nom', 'Correu electrònic', 'Missatge'],
    notice: 'Formulari de demostració. No s’envien ni es guarden dades.',
    closing: 'Repensar l’habitatge és també repensar com volem viure.',
    cta: 'Com t’agradaria viure?', contactLabel: 'Contacte', vote: /Votar|votaci[óo]/i,
  },
};

for (const [locale, c] of Object.entries(copy)) {
  const html = c.html;
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

  test(`${locale}: Investiguemos juntos shows LR 01-03 with description, meeting and a link to the form`, () => {
    assert.ok(!html.includes(c.old), `${c.old} must be gone`);
    assert.ok(!/Este año queremos conversar|Aquest any volem conversar/.test(html));
    const questions = section(html, 'research-questions');
    assert.deepEqual(headings(questions, 'h2'), [c.together]);
    assert.ok(text(questions).includes(c.cadence));
    const cards = [...questions.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(([, card]) => card);
    assert.equal(cards.length, 3);
    for (const [index, card] of cards.entries()) {
      assert.ok(text(card).startsWith(`LR 0${index + 1}`), `LR 0${index + 1} prefixes the question`);
      assert.equal(headings(card, 'h3')[0], c.questions[index]);
      assert.deepEqual([...card.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(([, p]) => text(p)),
        [`LR 0${index + 1}`, c.descriptions[index], c.meetings[index]]);
      assert.match(card, /<img\b[^>]*src="\/living-research\//);
      hasLink(card, '#research-participate', c.join);
    }
    assert.doesNotMatch(questions, /<time\b/);
    assert.ok(!text(questions).includes('misma manera') && !text(questions).includes('mateixa manera'),
      'The illegible LR01 sentence stays omitted');
  });

  test(`${locale}: method keeps its steps with descriptions and the community links to the form`, () => {
    const method = section(html, 'research-method');
    assert.ok(text(method).includes(c.methodEyebrow));
    assert.deepEqual(headings(method, 'h2'), [c.method]);
    assert.ok(text(method).includes(c.methodIntro));
    assert.deepEqual(headings(method, 'h3'), c.steps);
    const steps = [...method.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, step]) => step);
    assert.equal(steps.length, 5);
    for (const [index, step] of steps.entries()) {
      assert.ok(text(step).startsWith(`0${index + 1}`), 'Steps are numbered 01-05');
      assert.ok(text(step).includes(c.stepTexts[index]), `Missing description of ${c.steps[index]}`);
    }
    const community = section(html, 'research-community');
    assert.ok(text(community).includes(c.communityEyebrow));
    assert.deepEqual(headings(community, 'h2'), [c.community]);
    assert.ok(text(community).includes(c.communityText));
    assert.match(community, /outdoor-community\.png/);
    hasLink(community, '#research-participate', c.communityLink);
    assert.ok(!text(community).includes(c.formTitle), 'The form title is no longer the community call');
    assert.match(html, /<section\b[^>]*id="research-participate"/);
    assert.ok(html.indexOf('id="research-community"') < html.indexOf('id="research-participate"'));
  });

  test(`${locale}: participate form is a labelled no-send demo without voting`, () => {
    const participate = section(html, 'research-participate-title');
    assert.deepEqual(headings(participate, 'h2'), [c.formTitle]);
    assert.ok(text(participate).includes(c.notice));
    assert.ok(text(participate).includes(c.formIntro));
    for (const [index, id] of ['name', 'email', 'message'].entries()) {
      assert.match(participate, new RegExp(`<label[^>]*for="interest-${id}"[^>]*>\\s*${c.labels[index]}\\s*</label>`));
      assert.match(participate, new RegExp(`<(?:input|textarea)[^>]*id="interest-${id}"[^>]*required`));
      assert.match(participate.match(new RegExp(`<(?:input|textarea)[^>]*id="interest-${id}"[^>]*>`))?.[0] ?? '',
        new RegExp(`placeholder="${index < 2 ? c.labels[index] : c.message}"`));
    }
    assert.match(participate, /<input[^>]*id="interest-email"[^>]*type="email"|<input[^>]*type="email"[^>]*id="interest-email"/);
    assert.match(participate, /<button[^>]*id="interest-simulate"[^>]*type="button"[^>]*disabled/);
    assert.match(participate, /<button[^>]*id="interest-simulate"[^>]*>\s*Simula/i, 'The demo stays honestly labelled');
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
    assert.ok(text(closing).includes('Living Research'), 'Closing eyebrow');
    assert.match(closing, /sunset-clean-detail-crop\.png/);
    hasLink(closing, c.contact, c.cta);
    hasLink(closing, c.contact, c.contactLabel);
    assert.equal(text(html).split(c.closing).length - 1, 1, 'The phrase appears only once, in the closing');
    const footer = html.indexOf('<footer');
    assert.ok(footer > html.indexOf('id="research-contact"'), 'Footer follows the closing band');
    assert.ok(html.lastIndexOf('</section>', footer) > html.indexOf('id="research-contact"'));
    assert.ok(!closing.includes('<footer'));
  });

  test(`${locale}: complete copy with no untranslated new strings`, () => {
    if (locale === 'es') return;
    // Every Spanish editorial string (sentence-level) must be absent from the Catalan page.
    const shared = new Set(Object.values(copy.ca).flat().map(String));
    /** @type {string[]} */
    const spanish = Object.values(copy.es).flat().map(String).filter((v) => v.length > 7 && !v.startsWith('/') && v !== es);
    for (const phrase of spanish.filter((v) => !shared.has(v))) {
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


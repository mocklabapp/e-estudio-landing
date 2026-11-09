// @ts-check
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire, stripTypeScriptTypes } from 'node:module';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { simulateContactPreview } from '../src/lib/contact-preview.ts';

const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve('astro/package.json'));
/** @type {{ transform: (source: string, options: { filename: string, internalURL: string, resolvePath: (specifier: string) => string }) => Promise<{ code: string }> }} */
const compiler = await import(pathToFileURL(astroRequire.resolve('@astrojs/compiler-rs')).href);
const root = resolve(import.meta.dirname, '..');
const valid = { name: 'Prueba', contact: 'demo@example.test', subject: 'Consulta', message: 'Mensaje de prueba.' };

// Compile only this component tree in memory: no fixture copies, routes or build artifacts.
/** @param {string} path @returns {Promise<string>} */
async function compileComponent(path) {
  const source = await readFile(path, 'utf8');
  const result = await compiler.transform(source, {
    filename: path,
    internalURL: import.meta.resolve('astro/compiler-runtime'),
    resolvePath: specifier => specifier,
  });
  // Styles are bundled by the parent build; this check covers server-rendered HTML only.
  let code = result.code.replace(/^import ["'][^"']+\?astro&type=style[^"']*["'];\n/gm, '');
  for (const match of code.matchAll(/from\s+["']([^"']+\.astro)["']/g)) {
    const dependency = match[1].startsWith('@/')
      ? resolve(root, 'src', match[1].slice(2))
      : resolve(dirname(path), match[1]);
    code = code.replace(match[0], `from ${JSON.stringify(await compileComponent(dependency))}`);
  }
  // Resolve the component's typed local copy modules for Node's in-memory renderer.
  code = code.replace(/from\s+["'](@\/data\/localized\/[^"']+)["']/g, (_match, specifier) =>
    `from ${JSON.stringify(pathToFileURL(resolve(root, 'src', specifier.slice(2) + '.ts')).href)}`);
  return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
}

test('contact content renders truthful location, labels and a safe non-submitting demo', async () => {
  const container = await AstroContainer.create();
  /** @type {{ default: Parameters<typeof container.renderToString>[0] }} */
  const component = await import(await compileComponent(resolve(root, 'src/components/contact/ContactPage.astro')));
  const html = await container.renderToString(component.default);
  for (const text of [
    'Estamos en la', 'Casa Bot.', 'Escríbenos', 'Hablemos.', 'Ven a vernos', 'Justo encima de El Melindró.',
    'Nuestro estudio se encuentra en la primera planta de la Casa Antoni Clavell Bot, en el corazón de Cardedeu, justo encima de El Melindró.',
    'Plaça de l’Església, 23', '08440 Cardedeu, Barcelona',
    'Formulario de demostración. No se envían ni guardan datos.',
    '+34 615 123 456', 'hola@eestudiohabitar.com', '@e_estudio_habitar',
    'De lunes a viernes', '9:00–18:00', 'Con cita previa.',
  ]) assert.ok(html.includes(text), `Rendered content must include: ${text}`);
  for (const [id, label] of [
    ['name', 'Nombre'], ['contact', 'Email o teléfono'],
    ['subject', '¿Sobre qué quieres hablar?'], ['message', 'Mensaje'],
  ]) {
    assert.match(html, new RegExp(`<label[^>]*for="contact-${id}"[^>]*>\\s*${label.replace(/[?]/g, '\\?')}\\s*</label>`));
    assert.match(html, new RegExp(`<(?:input|select|textarea)[^>]*id="contact-${id}"[^>]*required`));
  }
  assert.match(html, /<select[^>]*id="contact-subject"/);
  assert.match(html, /role="form"[^>]*aria-labelledby="contact-form-title"/);
  assert.match(html, /<button[^>]*type="button"[^>]*disabled/);
  assert.match(html, /role="status"[^>]*aria-live="polite"/);
  assert.match(html, /<noscript>[\s\S]*JavaScript[\s\S]*<\/noscript>/);
  assert.doesNotMatch(html, /<form\b|\baction=|\bname=|href="#"/i);
  assert.doesNotMatch(html, /Mapa pendiente|Imagen pendiente|Vista de demostración sin mapa/);
  for (const href of ['tel:+34615123456', 'mailto:hola@eestudiohabitar.com', 'https://www.instagram.com/e_estudio_habitar/']) {
    assert.ok(html.includes(`href="${href}"`), `Approved contact link: ${href}`);
  }
  for (const [filename, width, height] of [['facade.png', 524, 499], ['interior.png', 496, 224]]) {
    const image = html.match(new RegExp(`<img\\b[^>]*src="/contact/${filename}"[^>]*>`))?.[0];
    assert.ok(image, `Rendered contact image: ${filename}`);
    assert.match(image, /alt="[^"]+"/);
    assert.ok(image.includes(`width="${width}"`) && image.includes(`height="${height}"`));
    const asset = await readFile(resolve(root, 'public/contact', String(filename)));
    assert.equal(asset.subarray(1, 4).toString(), 'PNG');
    assert.equal(asset.readUInt32BE(16), width);
    assert.equal(asset.readUInt32BE(20), height);
  }
  assert.doesNotMatch(html, /<iframe\b|output=embed|maps\/embed/i);
  const illustrations = [...html.matchAll(/<svg\b[^>]*role="img"[^>]*>[\s\S]*?<\/svg>/g)];
  assert.equal(illustrations.length, 1, 'One accessible illustrated location plan');
  const illustration = illustrations[0][0];
  const labelledBy = illustration.match(/aria-labelledby="([^"]+)"/)?.[1];
  assert.ok(labelledBy, 'The illustration has an accessible name and description');
  const labels = labelledBy.split(/\s+/).map(id => {
    const label = illustration.match(new RegExp(`<(?:title|desc)\\b[^>]*id="${id}"[^>]*>([\\s\\S]*?)<\\/(?:title|desc)>`));
    assert.ok(label, `Accessible SVG label exists: ${id}`);
    return label[1];
  }).join(' ');
  assert.match(labels, /e estudio/);
  assert.match(labels, /orientativo/i);
  assert.match(labels, /sin escala/i);
  for (const landmark of ['Ayuntamiento de Cardedeu', 'El Melindró', 'Plaça de l’Església']) {
    assert.ok(illustration.includes(landmark), `Illustrated landmark: ${landmark}`);
  }
  assert.match(html, />\s*Plano orientativo\s*</);
  assert.ok(html.includes('Plaça de l’Església, 23, 08440 Cardedeu, Barcelona'));
  const approvedMonogram = '<image href="/brand/monogram-dark.png" x="261" y="114" '
    + 'width="22" height="24" preserveAspectRatio="xMidYMid meet">';
  assert.deepEqual(illustration.match(/<image\b[^>]*>/gi), [approvedMonogram],
    'Exactly one approved local monogram, with the existing placement and dimensions');
  // Exempt only that exact opening tag; every other image/resource reference stays forbidden.
  const remainingIllustration = illustration.replace(approvedMonogram, '');
  assert.doesNotMatch(remainingIllustration, /<(?:script|image|foreignObject)\b|\bhref\s*=/i);
  assert.doesNotMatch(html, /\bsrc="https?:\/\/[^\"]*google/i);
  const directions = html.match(/<a\b[^>]*href="(https:\/\/www\.google\.com\/maps\/dir\/\?[^"]+)"[^>]*>\s*Cómo llegar en Google Maps\s*<\/a>/);
  assert.ok(directions, 'A native keyboard-accessible directions link is available');
  const map = new URL(directions[1].replaceAll('&amp;', '&'));
  assert.equal(map.origin, 'https://www.google.com');
  assert.equal(map.pathname, '/maps/dir/');
  assert.equal(map.searchParams.get('api'), '1');
  assert.equal(map.searchParams.get('destination'), 'Plaça de l’Església, 23, 08440 Cardedeu, Barcelona');
  assert.doesNotMatch(html, /<main\b|<html\b|participación|votaciones/i);
});

test('both contact locales visibly label the illustrated plan and retain accessible directions', async () => {
  const { fixture } = await import('./helpers/build-fixture.mjs');
  const build = await fixture();
  assert.equal(build.status, 0, build.output);
  for (const [route, label, description, directions] of [
    ['contacto', 'Plano orientativo', 'sin escala', 'Cómo llegar en Google Maps'],
    ['ca/contacte', 'Plànol orientatiu', 'sense escala', 'Com arribar-hi amb Google Maps'],
  ]) {
    const html = await build.html(`${route}/index.html`);
    const caption = html.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/)?.[1];
    assert.ok(caption, route);
    assert.ok(caption.includes(`>${label}</p>`), `${route}: visible standalone map label`);
    assert.ok(html.includes(description), `${route}: preserve no-scale description`);
    assert.ok(caption.includes(directions), `${route}: localized directions`);
    assert.match(caption, /href="https:\/\/www\.google\.com\/maps\/dir\/\?api=1/);
    assert.ok(caption.includes('Plaça de l’Església, 23, 08440 Cardedeu, Barcelona'));
  }
});

test('required and malformed values never produce simulated success', () => {
  const empty = simulateContactPreview({ name: ' ', contact: '', subject: '', message: '\n' });
  assert.equal(empty.valid, false);
  assert.deepEqual(Object.keys(empty.errors), ['name', 'contact', 'subject', 'message']);
  assert.match(empty.status, /Revisa/);
  for (const contact of ['no-contact', 'a@', '123', 'abc123456789', '1'.repeat(16)]) {
    const result = simulateContactPreview({ ...valid, contact });
    assert.equal(result.valid, false, contact);
    assert.ok('contact' in result.errors);
  }
  assert.equal(simulateContactPreview({ ...valid, message: 'a'.repeat(3001) }).valid, false);
});

test('email and phone simulations explicitly disclaim sending without echoing values', () => {
  for (const contact of [valid.contact, '+34 600 123 456', '(93) 123-45-67']) {
    const input = Object.freeze({ ...valid, contact });
    const result = simulateContactPreview(input);
    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, {});
    assert.equal(result.status, 'Simulación completada. No se ha enviado ningún mensaje ni se han guardado datos.');
    assert.ok(!JSON.stringify(result).includes(contact));
    assert.equal(input.message, valid.message);
  }
});

/** Minimal DOM surface for exercising the real enhancement, not a browser substitute. */
class Control {
  value = '';
  textContent = '';
  disabled = true;
  validityMessage = '';
  reported = false;
  /** @type {Map<string, string>} */
  attributes = new Map();
  /** @type {Map<string, (() => void)[]>} */
  listeners = new Map();
  /** @param {string} event @param {() => void} listener */
  addEventListener(event, listener) {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]);
  }
  /** @param {string} event */
  fire(event) { for (const listener of this.listeners.get(event) ?? []) listener(); }
  /** @param {string} name @param {string} value */
  setAttribute(name, value) { this.attributes.set(name, value); }
  /** @param {string} name */
  removeAttribute(name) { this.attributes.delete(name); }
  /** @param {string} message */
  setCustomValidity(message) { this.validityMessage = message; }
  reportValidity() { this.reported = true; return !this.validityMessage; }
  focus() { this.reported = true; }
}

test('enhancement validates, announces and resets safely without network, storage or navigation', async () => {
  const source = await readFile(resolve(root, 'src/lib/contact-preview.ts'), 'utf8');
  const code = stripTypeScriptTypes(source).replace(/^export /gm, '');
  const sandbox = Object.create(null);
  for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'localStorage', 'sessionStorage', 'navigator', 'location', 'document', 'console']) {
    Object.defineProperty(sandbox, name, { get() { assert.fail(`Unexpected side effect through ${name}`); } });
  }
  /** @type {(root: { querySelector: (selector: string) => Control | null }) => void} */
  const enhance = runInNewContext(`${code}\nenhanceContactPreview;`, sandbox);
  /** @type {Map<string, Control>} */
  const controls = new Map(['name', 'contact', 'subject', 'message', 'simulate', 'status'].map(id => [`#contact-${id}`, new Control()]));
  /** @param {string} id */
  const control = (id) => {
    const found = controls.get(`#contact-${id}`);
    assert.ok(found);
    return found;
  };
  enhance({ querySelector: selector => controls.get(selector) ?? null });
  assert.equal(control('simulate').disabled, false);
  control('simulate').fire('click');
  assert.match(control('status').textContent, /Revisa/);
  assert.equal(control('name').attributes.get('aria-invalid'), 'true');
  assert.equal(control('name').reported, true);
  for (const [id, value] of Object.entries(valid)) {
    control(id).value = value;
    control(id).fire('input');
    assert.equal(control(id).validityMessage, '');
  }
  control('simulate').fire('click');
  assert.match(control('status').textContent, /Simulación completada.*No se ha enviado/);
  control('message').value = '<img src=x onerror=alert(1)>';
  control('message').fire('input');
  assert.equal(control('status').textContent, '');
  control('simulate').fire('click');
  assert.ok(!control('status').textContent.includes('<img'));
  control('contact').value = 'invalid';
  control('simulate').fire('click');
  assert.match(control('status').textContent, /Revisa/);
  assert.equal(control('contact').attributes.get('aria-invalid'), 'true');
  assert.doesNotThrow(() => enhance({ querySelector: () => null }));
  assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|sendBeacon|\.submit\(/);
});

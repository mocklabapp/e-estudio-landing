// @ts-check
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { renderUnconfiguredHome } from './helpers/build-fixture.mjs';

const output = new URL('../dist/client/', import.meta.url);
const routes = ['', 'estudio/', 'servicios/', 'living-research/', 'contacto/'];

/** @param {string} html @param {string} filename @param {string} alt */
function logo(html, filename, alt) {
  const image = [...html.matchAll(/<img\b[^>]*>/g)]
    .map(([tag]) => tag).find((tag) => tag.includes(`src="/brand/${filename}"`));
  assert.ok(image, `Missing supplied logo ${filename}`);
  assert.ok(image.includes(`alt="${alt}"`), 'Logo must have an accessible name');
  const typographic = filename.includes('typographic');
  assert.ok(image.includes(`width="${typographic ? 348 : 473}"`));
  assert.ok(image.includes(`height="${typographic ? 99 : 153}"`));
}

for (const route of routes) {
  test(`/${route} uses original studio artwork and branded document icons`, async () => {
    const html = route === ''
      ? await renderUnconfiguredHome(fileURLToPath(new URL('../', import.meta.url)))
      : await readFile(new URL(`${route}index.html`, output), 'utf8');
    const header = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/)?.[1];
    const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1];
    assert.ok(header && footer, 'Shared shell must remain present');
    logo(header, 'e-estudio-primary-dark.png', 'e estudio — Arquitectura residencial');
    logo(footer, 'e-estudio-typographic-dark.png', 'e estudio — Arquitectura residencial');
    for (const region of [header, footer]) {
      assert.match(region, /<a\b[^>]*href="\/"[^>]*aria-label="e estudio — Inicio"/);
      assert.doesNotMatch(region, /class="(?:monogram|wordmark|tagline)"/);
    }
    const icons = [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => tag);
    for (const [filename, attributes] of [
      ['favicon.ico', ['rel="icon"', 'type="image/x-icon"']],
      ['favicon-32.png', ['rel="icon"', 'sizes="32x32"', 'type="image/png"']],
      ['favicon-white-32.png', ['rel="icon"', 'sizes="32x32"',
        'media="(prefers-color-scheme: dark)"']],
      ['favicon-180.png', ['rel="apple-touch-icon"', 'sizes="180x180"']],
    ]) {
      const icon = icons.find((tag) => tag.includes(`href="/brand/${filename}"`));
      assert.ok(icon, `Missing ${filename}`);
      for (const attribute of attributes) assert.ok(icon.includes(attribute), attribute);
    }
    assert.doesNotMatch(html, /href="\/favicon\.svg"/);
  });
}

test('Services uses the supplied living primary without changing its contact destination', async () => {
  const html = await readFile(new URL('servicios/index.html', output), 'utf8');
  logo(html, 'e-living-primary-dark.png', 'e living — Inmobiliaria y servicios');
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.ok(links.some(([, href, content]) => href === '/contacto/'
    && content.replace(/<[^>]*>/g, ' ').includes('Preguntar por e living')));
});

// SHA-256 values of the human-supplied files: no external folder is needed in CI.
/** @type {Record<string, string>} */
const originals = {
  'e-estudio-primary-dark.png': '6c6a240d4b09b5bbd4e944c4153c3ca5b0fa4a89312f81128e2d46dd536c5381',
  'e-estudio-typographic-dark.png': '9c5209dd3beeabb58e31ce30d5b7f30a7b6229e293708205c216997597190413',
  'e-living-primary-dark.png': '23db5a5933ef5353d847e200e72a91bbd4784ad423705b910eb1368752afe7d9',
  'favicon.ico': 'ea828955554866e0d9a772ac75be8353cfc25c2189873fc20301c89f5fdaf2b1',
  'favicon-32.png': 'c9794009e26f587a0532f4a05327a6017cea3b4dbe7c3cb531999d3df2c41e1f',
  'favicon-white-32.png': '5c07263c397d76b3c322d6a99389a89b5436df99b18777ca6118d1daef6a406c',
  'favicon-180.png': '8f409822f061c5222b3f3ad44cf801568305a4905bfca1e3582ed23a2c40ce01',
};

test('delivered brand files preserve the supplied bytes and PNG transparency', async () => {
  for (const [filename, digest] of Object.entries(originals)) {
    const source = await readFile(new URL(`../public/brand/${filename}`, import.meta.url));
    const delivered = await readFile(new URL(`brand/${filename}`, output));
    assert.equal(createHash('sha256').update(source).digest('hex'), digest, filename);
    assert.deepEqual(delivered, source, `Build changed ${filename}`);
    if (filename.endsWith('.png')) {
      assert.equal(source.toString('ascii', 12, 16), 'IHDR');
      assert.equal(source[25], 6, `${filename} must retain RGBA transparency`);
    }
  }
});

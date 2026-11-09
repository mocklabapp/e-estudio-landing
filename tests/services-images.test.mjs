// @ts-check
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const output = new URL('../dist/client/', import.meta.url);

test('services publishes the supplied photographs with descriptive alternatives before each offer', async () => {
  const html = await readFile(new URL('servicios/index.html', output), 'utf8');
  const expected = [
    {
      section: 'service-inhabit',
      name: 'habitar',
      alt: 'Comedor luminoso con mesa de madera y ventanales abiertos al jardín.',
    },
    {
      section: 'service-develop',
      name: 'promover',
      alt: 'Edificio residencial con balcones y un jardín arbolado junto al acceso.',
    },
  ];

  for (const { section, name, alt } of expected) {
    const card = html.match(new RegExp(
      `<section\\b[^>]*aria-labelledby="${section}"[^>]*>([\\s\\S]*?)<\\/section>`,
    ))?.[1];
    assert.ok(card, `Missing ${name} offer`);
    const images = [...card.matchAll(/<img\b[^>]*>/g)];
    assert.equal(images.length, 1, `${name} must show one real photograph`);
    const image = images[0][0];
    assert.ok(image.includes(`src="/services/${name}.png"`));
    assert.ok(image.includes(`alt="${alt}"`));
    assert.ok(card.indexOf(image) < card.indexOf('<h2'));
    assert.doesNotMatch(card, /Imagen pendiente/);

    const delivered = await readFile(new URL(`services/${name}.png`, output));
    const source = await readFile(new URL(`../public/services/${name}.png`, import.meta.url));
    assert.deepEqual(delivered, source, 'The built route must deliver the supplied asset unchanged');
    assert.equal(delivered.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.ok(image.includes(`width="${delivered.readUInt32BE(16)}"`));
    assert.ok(image.includes(`height="${delivered.readUInt32BE(20)}"`));
  }
});

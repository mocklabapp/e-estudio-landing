// @ts-check
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseProjectImages } from '../src/lib/project-images.ts';
import { parseProjectsResponse } from '../src/lib/projects-response.ts';

const origin = 'https://abcdefghijklmnopqrst.supabase.co';
const prefix = `${origin}/storage/v1/object/public/projects-images/`;

for (const bucket of ['projects-images', 'user-media']) {
  test(`public ${bucket} images preserve order and encoded object names but omit extras`, () => {
    const urls = ['house.jpg', 'folder/caf%C3%A9%20%25%23%3F.jpg', '100%25-complete.jpg']
      .map((path) => `${origin}/storage/v1/object/public/${bucket}/${path}`);
    assert.deepEqual(parseProjectImages(urls.map((url) => ({ url, prompt: 'PRIVATE' })), origin),
      urls.map((url) => ({ url })));
    assert.deepEqual(parseProjectImages([], origin), []);
  });
}

const unsafe = [
  '', 'https://evil.test/image.jpg', prefix.replace('https:', 'http:') + 'image.jpg',
  prefix.replace('abcdefghijklmnopqrst', 'tsrqponmlkjihgfedcbaa') + 'image.jpg',
  prefix.replace('.co/', '.co:443/') + 'image.jpg',
  prefix.replace('https://', 'https://user:password@') + 'image.jpg',
  prefix.replace('/public/', '/sign/') + 'image.jpg',
  prefix.replace('projects-images', 'private-bucket') + 'image.jpg',
  ...['', 'folder/', '../image.jpg', './image.jpg', 'folder/../image.jpg',
    '%2e%2e/image.jpg', '%252e%252e/image.jpg', '%25252e%25252e/image.jpg',
    '100%25/%252e%252e/image.jpg', 'folder%2f..%2fimage.jpg', 'folder\\image.jpg',
    'image%5c.jpg', 'image%255c.jpg', 'image%00.jpg', 'image%250a.jpg', 'image%7f.jpg',
    'image%.jpg', 'image%C0%AE.jpg', 'image.jpg?token=private', 'image.jpg#fragment',
    'image name.jpg', 'image\n.jpg', 'image\t.jpg',
  ].map((path) => prefix + path),
];
for (const [index, url] of unsafe.entries()) {
  test(`unsafe image URL ${index} fails closed`, () => {
    assert.throws(() => parseProjectImages([{ url: `${prefix}valid.jpg` }, { url }], origin),
      { message: 'Projects unavailable' });
  });
}

for (const value of [null, undefined, {}, 'image', [null], [[]], [{}], [{ url: null }], [{ url: 1 }]]) {
  test(`invalid image structure ${JSON.stringify(value)} fails closed`, () => {
    assert.throws(() => parseProjectImages(value, origin), { message: 'Projects unavailable' });
  });
}

test('image origin must be the exact configured Supabase origin', () => {
  for (const invalid of ['https://evil.test', `${origin}/`, origin.replace('https:', 'http:')]) {
    assert.throws(() => parseProjectImages([{ url: `${prefix}house.jpg` }], invalid),
      { message: 'Projects unavailable' });
  }
});

test('present undefined additive fields cannot masquerade as legacy omissions', () => {
  const project = { id: '1', title: null, description: null, weblink: null,
    originalLanguage: null, translations: [] };
  for (const field of ['images', 'category', 'year']) {
    assert.throws(() => parseProjectsResponse({ projects: [{ ...project, [field]: undefined }] }, origin),
      { message: 'Projects unavailable' });
  }
});

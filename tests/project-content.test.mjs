// @ts-check
import assert from 'node:assert/strict';
import test from 'node:test';
import { selectProjectContent } from '../src/lib/project-content.ts';

/** @type {import('../src/lib/projects.ts').PublicProject} */
const project = {
  id: '1', title: ' Original ', description: 'Original description', weblink: null,
  originalLanguage: 'es',
  translations: [
    { language: 'es', title: 'Do not prefer this', description: null },
    { language: 'en', title: 'Translation', description: null },
    { language: 'fr-CA', title: null, description: 'Description française' },
  ],
};

test('original exact match takes precedence and preserves text unchanged', () => {
  assert.deepEqual(selectProjectContent(project, 'es'), {
    language: 'es', source: 'original', title: ' Original ', description: 'Original description',
  });
});

test('translations use arbitrary exact keys without mixing partial fields', () => {
  assert.deepEqual(selectProjectContent(project, 'en'), {
    language: 'en', source: 'translation', title: 'Translation', description: null,
  });
  assert.deepEqual(selectProjectContent(project, 'fr-CA'), {
    language: 'fr-CA', source: 'translation', title: null, description: 'Description française',
  });
  assert.deepEqual(selectProjectContent({ ...project, title: null }, 'es'), {
    language: 'es', source: 'original', title: null, description: 'Original description',
  });
});

test('missing or unknown original language never implies a fallback', () => {
  for (const language of ['ca', 'ES', 'fr-ca']) {
    assert.deepEqual(selectProjectContent(project, language), {
      language, source: 'missing', title: null, description: null,
    });
  }
  const unknown = { ...project, originalLanguage: null, translations: [] };
  assert.deepEqual(selectProjectContent(unknown, 'es'), {
    language: 'es', source: 'missing', title: null, description: null,
  });
  assert.equal(selectProjectContent({ ...project, originalLanguage: null }, 'en').source, 'translation');
});

test('selection does not mutate the public project or its translations', () => {
  const before = structuredClone(project);
  project.translations.forEach(Object.freeze);
  Object.freeze(project.translations);
  Object.freeze(project);
  for (const language of ['es', 'en', 'ca']) selectProjectContent(project, language);
  assert.deepEqual(project, before);
});

// @ts-check
import assert from 'node:assert/strict';
import test from 'node:test';
import { selectPilotProjectContent } from '../src/lib/pilot-project-content.ts';
import { selectProjectContent } from '../src/lib/project-content.ts';
import { pilotProject } from './fixtures/pilot-project.ts';

test('pilot Spanish displays unknown-language originals without mutating or relabelling the DTO', () => {
  const project = structuredClone(pilotProject);
  Object.freeze(project.translations);
  Object.freeze(project);
  assert.deepEqual(selectPilotProjectContent(project, 'es'), {
    language: 'es', source: 'original', title: project.title, description: project.description,
  });
  assert.deepEqual(project, pilotProject);
  assert.equal(project.originalLanguage, null);
  assert.equal(selectProjectContent(project, 'es').source, 'missing');
  assert.equal(selectPilotProjectContent({ ...project, title: null }, 'es').title, null);
});

for (const language of ['ca', 'es']) {
  test(`${language}: complete translation wins and preserves its whitespace`, () => {
    const translation = { language, title: '  Títol traduït  ', description: '\nDescripció traduïda\n' };
    for (const originalLanguage of ['en', null]) {
      const project = { ...pilotProject, originalLanguage, translations: [translation] };
      assert.deepEqual(selectPilotProjectContent(project, language), {
        ...translation, source: 'translation',
      });
    }
  });

  test(`${language}: missing translation uses both original fields regardless of original language`, () => {
    for (const originalLanguage of ['en', null]) {
      const project = { ...pilotProject, originalLanguage, translations: [
        { language: 'fr', title: 'Autre titre', description: 'Autre description' },
      ] };
      assert.deepEqual(selectPilotProjectContent(project, language), {
        language, source: 'original', title: project.title, description: project.description,
      });
    }
  });

  for (const field of ['title', 'description']) {
    for (const value of [null, '', ' \t\n\u00a0 ']) {
      test(`${language}: ${field}=${JSON.stringify(value)} falls back to the whole original`, () => {
        for (const originalLanguage of ['en', null]) {
          const translation = { language, title: 'Translated title', description: 'Translated description',
            [field]: value };
          const project = { ...pilotProject, originalLanguage, translations: [translation] };
          assert.deepEqual(selectPilotProjectContent(project, language), {
            language, source: 'original', title: project.title, description: project.description,
          });
          // The reusable selector still preserves partial translations without fallback.
          assert.deepEqual(selectProjectContent(project, language), { ...translation, source: 'translation' });
        }
      });
    }
  }

  test(`${language}: original selection wins even when partial or blank`, () => {
    for (const content of [
      { title: null, description: 'Original description' },
      { title: 'Original title', description: null },
      { title: null, description: null },
      { title: '', description: ' \n ' },
    ]) {
      const project = { ...pilotProject, ...content, originalLanguage: language, translations: [
        { language, title: 'Not preferred', description: 'Not preferred either' },
      ] };
      assert.deepEqual(selectPilotProjectContent(project, language), {
        language, source: 'original', ...content,
      });
    }
  });

  test(`${language}: fallback preserves null and partial originals without filling from translation`, () => {
    for (const content of [
      { title: null, description: 'Original description' },
      { title: 'Original title', description: null },
      { title: null, description: null },
    ]) {
      const project = { ...pilotProject, ...content, translations: [
        { language, title: 'Translated title', description: null },
      ] };
      assert.deepEqual(selectPilotProjectContent(project, language), {
        language, source: 'original', ...content,
      });
    }
  });
}

test('language matching remains exact without inferring regional or case variants', () => {
  const translation = { language: 'fr-CA', title: 'Titre', description: 'Description' };
  const project = { ...pilotProject, translations: [translation] };
  assert.deepEqual(selectPilotProjectContent(project, 'fr-CA'), { ...translation, source: 'translation' });
  for (const language of ['en', 'CA', 'fr-ca', 'ES']) {
    assert.deepEqual(selectPilotProjectContent(project, language), {
      language, source: 'original', title: project.title, description: project.description,
    });
  }
});

test('translated selection and fallback leave the complete input unchanged and original language unknown', () => {
  const project = structuredClone(pilotProject);
  project.translations = [
    { language: 'ca', title: 'Títol', description: 'Descripció' },
    { language: 'es', title: 'Título', description: null },
  ];
  const before = structuredClone(project);
  project.translations.forEach(Object.freeze);
  Object.freeze(project.translations);
  Object.freeze(project);
  for (const language of ['ca', 'es', 'en']) selectPilotProjectContent(project, language);
  assert.deepEqual(project, before);
  assert.equal(project.originalLanguage, null);
});

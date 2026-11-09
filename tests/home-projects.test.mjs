// @ts-check
import assert from 'node:assert/strict';
import test from 'node:test';
import { latestHomeProjects } from '../src/lib/home-projects.ts';

/** @param {string} id @returns {import('../src/lib/projects.ts').PublicProject} */
const project = (id) => ({
  id, title: null, description: null, weblink: null, originalLanguage: null, translations: [],
});

test('latest Home selection is precision-safe and does not mutate the public input', () => {
  const projects = Object.freeze(['2', '10', '9007199254740992', '9007199254740993',
    '9223372036854775807'].map(project));
  const before = structuredClone(projects);
  assert.deepEqual(latestHomeProjects(projects).map(({ id }) => id), [
    '9223372036854775807', '9007199254740993', '9007199254740992',
  ]);
  assert.deepEqual(projects, before);
  assert.deepEqual(latestHomeProjects([project('2'), project('10')]).map(({ id }) => id), ['10', '2']);
  assert.deepEqual(latestHomeProjects([]), []);
});

// @ts-check
import assert from 'node:assert/strict';
import test from 'node:test';
import { projectCategoryIds, getProjectCategoryLabel, getProjectCategoryOptions } from '../src/lib/project-categories.ts';

const ids = ['residencial', 'docente', 'oficinas', 'planeamiento', 'industrial',
  'cultural', 'publico', 'rehabilitacion', 'interiorismo', 'sanitario'];
const spanish = ['Residencial', 'Docente', 'Oficinas', 'Planeamiento', 'Industrial',
  'Cultural', 'Espacio público', 'Rehabilitación', 'Interiorismo', 'Sanitario'];
const english = ['Residential', 'Educational', 'Offices', 'Urban planning', 'Industrial',
  'Cultural', 'Public space', 'Rehabilitation', 'Interior design', 'Healthcare'];

const catalan = ['Residencial', 'Docent', 'Oficines', 'Planejament', 'Industrial',
  'Cultural', 'Espai públic', 'Rehabilitació', 'Interiorisme', 'Sanitari'];

test('catalog separates stable IDs from complete Spanish, Catalan and English labels', () => {
  assert.deepEqual(projectCategoryIds, ids);
  for (const { locale, labels } of [{ locale: 'es', labels: spanish }, { locale: 'ca', labels: catalan }, { locale: 'en', labels: english }]) {
    const options = ids.map((value, index) => ({ value, label: labels[index] }));
    assert.deepEqual(getProjectCategoryOptions(locale), options);
    ids.forEach((id, index) => assert.equal(getProjectCategoryLabel(id, locale), labels[index]));
  }
});

test('missing and unknown values and languages return null without normalization or fallback', () => {
  for (const value of [null, undefined, '', 'Residential', 'Residencial', ' residencial', 'unknown', 'constructor', '__proto__']) {
    assert.equal(getProjectCategoryLabel(value, 'es'), null);
  }
  for (const locale of [null, undefined, '', 'fr', 'ES', 'en-US', 'constructor', '__proto__']) {
    assert.equal(getProjectCategoryLabel('residencial', locale), null);
    assert.equal(getProjectCategoryOptions(locale), null);
  }
});

test('option changes cannot mutate the catalog or later lookups', () => {
  const options = getProjectCategoryOptions('es');
  assert.ok(options);
  options[0].label = 'Changed';
  options.reverse();
  assert.equal(getProjectCategoryLabel('residencial', 'es'), 'Residencial');
  assert.equal(getProjectCategoryOptions('es')?.[0].value, 'residencial');
});

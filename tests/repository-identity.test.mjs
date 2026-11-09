// @ts-check
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

/** @param {unknown} value @returns {Record<string, unknown>} */
function record(value) {
  assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value));
  return Object.fromEntries(Object.entries(value));
}

// Deliberately package-only: no fixtures, builds, environment reads or writes.
const pkg = record(JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')));
const scripts = record(pkg.scripts);

test('the independent client package is named e-estudio-landing', () => {
  assert.equal(pkg.name, 'e-estudio-landing');
  assert.equal(pkg.type, 'module');
});

test('client maintenance exposes no initializer or shared-backend commands', () => {
  assert.equal(scripts['init:client'], undefined);
  assert.equal(scripts['check:client-init'], undefined);
  for (const command of Object.values(scripts)) {
    assert.equal(typeof command, 'string');
    assert.doesNotMatch(String(command), /init-client|client-init|test-projects-sql|supabase\//);
  }
});

test('retained tooling has an explicit strict no-output typecheck', () => {
  const command = scripts['check:tooling'];
  assert.equal(typeof command, 'string');
  const words = String(command).split(/\s+/);
  assert.equal(words[0], 'tsc');
  for (const flag of ['--ignoreConfig', '--noEmit', '--strict', '--allowJs', '--checkJs']) {
    assert.ok(words.includes(flag), `Missing strict tooling flag: ${flag}`);
  }
  for (const path of ['tests/i18n.test.mjs', 'tests/helpers/build-fixture.mjs',
    'tests/repository-identity.test.mjs', 'tests/toolchain.test.mjs']) {
    assert.ok(words.includes(path), `Missing retained tooling coverage: ${path}`);
  }
});

test('client cleanup preserves the pinned runtime and complete validation pipelines', () => {
  assert.equal(record(pkg.engines).node, '24.x');
  assert.equal(pkg.packageManager, 'pnpm@12.16.1');
  assert.equal(scripts.test, 'astro build && node --test tests/*.test.mjs');
  assert.equal(scripts.validate, 'astro check && astro build && node --test tests/*.test.mjs');
  for (const [name, command] of Object.entries({ dev: 'astro dev', check: 'astro check',
    build: 'astro build', preview: 'astro preview', astro: 'astro' })) {
    assert.equal(scripts[name], command);
  }
});

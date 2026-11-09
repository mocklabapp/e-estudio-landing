// @ts-check
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseEnv } from 'node:util';

/** @param {string} path */
export const readSource = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

export async function packageContract() {
  /** @type {unknown} */
  const value = JSON.parse(await readSource('package.json'));
  assert.ok(value && typeof value === 'object');
  assert.ok('scripts' in value && value.scripts && typeof value.scripts === 'object');
  assert.ok('engines' in value && value.engines && typeof value.engines === 'object');
  assert.ok('node' in value.engines && typeof value.engines.node === 'string');
  assert.ok('packageManager' in value && typeof value.packageManager === 'string');
  /** @type {Record<string, string>} */
  const scripts = {};
  for (const [name, command] of Object.entries(value.scripts)) {
    assert.equal(typeof command, 'string');
    assert.ok(typeof command === 'string');
    scripts[name] = command;
  }
  return { scripts, node: value.engines.node, manager: value.packageManager,
    overrides: 'overrides' in value ? value.overrides : undefined };
}

/** Execute real package scripts with controlled Astro and Node-test boundaries.
 * @param {'test' | 'validate'} script
 * @param {'check' | 'build' | 'tests' | undefined} failure
 */
export async function runScript(script, failure = undefined) {
  const pkg = await packageContract();
  const root = await mkdtemp(join(tmpdir(), 'base-landing-mocklab-toolchain-'));
  await mkdir(join(root, 'node_modules', '.bin'), { recursive: true });
  await mkdir(join(root, 'tests'));
  await mkdir(join(root, 'hostile'));
  const manifest = JSON.stringify({ type: 'module', packageManager: pkg.manager, scripts: pkg.scripts });
  await writeFile(join(root, 'package.json'), manifest);
  const events = join(root, 'events');
  await writeFile(events, '');
  await writeFile(join(root, 'node_modules', '.bin', 'astro'), `#!/bin/sh
printf '%s\\n' "$1" >> "$EVENTS"
[ "$FAIL_AT" != "$1" ] || exit 23
`, { mode: 0o755 });
  await writeFile(join(root, 'hostile', 'pnpm'), `#!/bin/sh
printf 'nested-pnpm\\n' >> "$EVENTS"
exit 91
`, { mode: 0o755 });
  await writeFile(join(root, 'tests', 'controlled.test.mjs'), `import { appendFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
test('controlled test boundary', () => {
  appendFileSync(process.env.EVENTS, 'tests\\n');
  assert.notEqual(process.env.FAIL_AT, 'tests');
});
`);
  /** @type {NodeJS.ProcessEnv} */
  const env = { ...process.env, EVENTS: events, FAIL_AT: failure ?? '',
    PATH: `${join(root, 'hostile')}:${process.env.PATH}` };
  // The fixture starts an independent Node test runner, not a recursive child test.
  delete env.NODE_TEST_CONTEXT;
  delete env.SUPABASE_URL;
  delete env.SUPABASE_SECRET_KEY;
  delete env.GALIA_USER_ID;
  delete env.GALIA_PROJECTS_URL;
  delete env.MOCKLAB_USER_ID;
  delete env.MOCKLAB_PROJECTS_URL;
  delete env.SUPABASE_ANON_KEY;
  delete env.PUBLIC_PROJECTS_ROLE_JWT;
  const result = spawnSync('corepack', ['pnpm', 'run', script], { cwd: root, env, encoding: 'utf8' });
  assert.ifError(result.error);
  assert.equal(await readFile(join(root, 'package.json'), 'utf8'), manifest);
  return { status: result.status, output: result.stdout + result.stderr,
    events: (await readFile(events, 'utf8')).trim().split('\n').filter(Boolean) };
}

/** @param {string} source */
export function environmentExampleIssue(source) {
  /** @type {ReturnType<typeof parseEnv>} */
  let parsed;
  try {
    parsed = parseEnv(source);
  } catch {
    // Parser errors must never forward the human-owned input or its values.
    return 'invalid syntax';
  }
  const expected = ['MOCKLAB_PROJECTS_URL', 'MOCKLAB_USER_ID'];
  if (expected.some((name) => !Object.hasOwn(parsed, name))) return 'missing keys';
  if (Object.keys(parsed).some((name) => !expected.includes(name))) return 'extra keys';
  if (Object.values(parsed).some((value) => value !== '')) return 'nonempty values';
  return null;
}

/** @param {string} ignoreRules */
export async function ignoredEnvironmentFiles(ignoreRules) {
  const root = await mkdtemp(join(tmpdir(), 'base-landing-mocklab-env-ignore-'));
  await writeFile(join(root, '.gitignore'), ignoreRules);
  const init = spawnSync('git', ['init', '--quiet'], { cwd: root, encoding: 'utf8' });
  assert.equal(init.status, 0, init.stderr);
  return spawnSync('git', ['check-ignore', '--no-index', '--stdin'], {
    cwd: root, input: '.env\n.env.local\n.env.production\n.env.example\n', encoding: 'utf8',
  });
}

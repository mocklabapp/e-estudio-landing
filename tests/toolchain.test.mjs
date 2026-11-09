// @ts-check
import assert from 'node:assert/strict';
import test from 'node:test';
import { environmentExampleIssue, ignoredEnvironmentFiles, packageContract, readSource as read, runScript } from './helpers/toolchain-fixture.mjs';

test('the client pins Node 24 and pnpm with the preserved frozen lock', async () => {
  const pkg = await packageContract();
  assert.equal(pkg.node, '24.x');
  assert.equal(pkg.manager, 'pnpm@12.16.1');
  assert.equal((await read('.nvmrc')).trim(), '24');
  assert.equal(pkg.scripts.test, 'astro build && node --test tests/*.test.mjs');
  assert.equal(pkg.scripts.validate, 'astro check && astro build && node --test tests/*.test.mjs');
  for (const [name, command] of Object.entries({ dev: 'astro dev', check: 'astro check',
    build: 'astro build', preview: 'astro preview', astro: 'astro' })) {
    assert.equal(pkg.scripts[name], command);
  }
  assert.equal(pkg.overrides, undefined);
  await assert.rejects(read('package-lock.json'), { code: 'ENOENT' });
  assert.match(await read('pnpm-workspace.yaml'), /'@vercel\/routing-utils>path-to-regexp': '6\.3\.0'/);
  const lock = await read('pnpm-lock.yaml');
  assert.match(lock, /lockfileVersion:/);
  assert.match(lock, /'@vercel\/routing-utils>path-to-regexp': 6\.3\.0/);
});

for (const script of /** @type {const} */ (['test', 'validate'])) {
  test(`${script} executes in order without invoking pnpm from PATH`, async () => {
    const result = await runScript(script);
    assert.equal(result.status, 0, result.output);
    assert.deepEqual(result.events, script === 'test' ? ['build', 'tests'] : ['check', 'build', 'tests']);
    assert.match(result.output, /controlled test boundary/);
  });

  test(`${script} preserves failures and short-circuits subsequent commands`, async () => {
    const stages = script === 'test' ? ['build', 'tests'] : ['check', 'build', 'tests'];
    for (const stage of /** @type {const} */ (['check', 'build', 'tests'])) {
      if (!stages.includes(stage)) continue;
      const result = await runScript(script, stage);
      assert.equal(result.status, stage === 'tests' ? 1 : 23, result.output);
      assert.deepEqual(result.events, stages.slice(0, stages.indexOf(stage) + 1));
      if (stage === 'tests') {
        assert.match(result.output, /controlled test boundary/);
        assert.match(result.output, /ERR_ASSERTION/);
      }
    }
  });
}

test('environment validation accepts legal formatting without weakening empty values', () => {
  const valid = ' export MOCKLAB_PROJECTS_URL = "" # public endpoint\r\n MOCKLAB_USER_ID=\'\'\r\n';
  assert.equal(environmentExampleIssue(valid), null);
  const canonical = 'MOCKLAB_PROJECTS_URL=\nMOCKLAB_USER_ID=\n';
  assert.equal(environmentExampleIssue(canonical), null);
  for (const [source, issue] of [
    [canonical.replace('MOCKLAB_PROJECTS_URL=', 'MOCKLAB_PROJECTS_URL=DO_NOT_DISCLOSE'), 'nonempty values'],
    [canonical.replace('MOCKLAB_USER_ID=\n', ''), 'missing keys'],
    ['GALIA_PROJECTS_URL=\nGALIA_USER_ID=\n', 'missing keys'],
    [canonical + 'GALIA_PROJECTS_URL=\nGALIA_USER_ID=\n', 'extra keys'],
    [canonical + 'UNKNOWN_DO_NOT_DISCLOSE=\n', 'extra keys'],
    [canonical + 'SUPABASE_SECRET_KEY=\n', 'extra keys'],
  ]) {
    assert.equal(environmentExampleIssue(source), issue);
    assert.ok(!String(environmentExampleIssue(source)).includes('DO_NOT_DISCLOSE'));
  }
});

test('the canonical environment example is blank and distributable', async () => {
  const example = await read('.env.example');
  const issue = environmentExampleIssue(example);
  assert.equal(issue, null, issue === null ? undefined : `Environment example: ${issue}; correct manually.`);
  const result = await ignoredEnvironmentFiles(await read('.gitignore'));
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.stdout.trim().split('\n'), ['.env', '.env.local', '.env.production']);
});

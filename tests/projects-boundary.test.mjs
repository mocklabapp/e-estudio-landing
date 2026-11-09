// @ts-check
import assert from 'node:assert/strict';
import { appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { fixture } from './helpers/build-fixture.mjs';

test('Astro rejects browser imports of the server-only projects function', async () => {
  for (const name of ['MOCKLAB_PROJECTS_URL', 'MOCKLAB_USER_ID', 'GALIA_PROJECTS_URL', 'GALIA_USER_ID', 'SUPABASE_URL',
    'SUPABASE_SECRET_KEY', 'SUPABASE_ANON_KEY', 'PUBLIC_PROJECTS_ROLE_JWT']) delete process.env[name];
  const result = await fixture(async ({ root }) => {
    await appendFile(join(root, 'src/pages/index.astro'), `
<script>
  import { getProjects } from '../lib/projects';
  getProjects().then(console.log);
</script>
`);
  });
  assert.notEqual(result.status, 0);
  assert.match(result.output, /astro:env\/server/);
  assert.match(result.output, /ServerOnlyModule|server-side/i);
});

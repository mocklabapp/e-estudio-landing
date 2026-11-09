// @ts-check
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fixture } from './build-fixture.mjs';

/** Build and type-check the exact copyable guide example in isolated routes. */
export async function localizedProjectFixture() {
  const guide = await readFile(new URL('../../docs/projects.md', import.meta.url), 'utf8');
  const example = guide.match(/```astro\n([\s\S]*?)\n```/u)?.[1];
  assert.ok(example, 'Native Astro example must exist');
  return fixture(async ({ root, replace }) => {
    // The guide example deliberately exercises ES/EN, not the client's ES/CA policy.
    await replace('src/i18n/locales.ts', "= ['es', 'ca'];", "= ['es', 'en'];");
    // Distinct stable fixture copy; do not depend on the starter's identity.
    await writeFile(join(root, 'src/data/pages.ts'), `
import type { Locale } from '../i18n/locales';
export interface PageTranslation { slug: string; title: string; description: string; body: string }
export interface Page { id: string; translations: Partial<Record<Locale, PageTranslation>> }
export const pages: Page[] = [{ id: 'home', translations: {
  es: { slug: '', title: 'Página local', description: 'Metadatos locales', body: 'Cuerpo local' },
  en: { slug: '', title: 'Local page', description: 'Local metadata', body: 'Local body' },
} }];
`);
    for (const route of ['index.astro', '[...path].astro']) {
      await writeFile(join(root, 'src/pages', route), example);
    }
    const check = spawnSync(process.execPath,
      [join(dirname(root), 'node_modules/astro/bin/astro.mjs'), 'check'], {
        cwd: root, encoding: 'utf8', timeout: 120_000,
        env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
      });
    assert.equal(check.status, 0, check.stdout + check.stderr);
  });
}

/** @param {number} version */
export function projectResponse(version) {
  if (version === 3) return new Response('private-upstream-detail', { status: 403 });
  return Response.json({ projects: [
    { id: '1', title: `Original v${version}`, description: null, weblink: null,
      originalLanguage: 'es', translations: [
        { language: 'en', title: `Translated v${version}`, description: null },
      ] },
    { id: '2', title: 'Untranslated original must not leak', description: null, weblink: null,
      originalLanguage: 'es', translations: [] },
  ] });
}

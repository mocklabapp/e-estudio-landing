# e estudio: Spanish and Catalan

Spanish remains the default at `/`; Catalan is enabled at `/ca/`. English remains disabled. This is the approved client translation, not a redesign or launch authorization.

## Routes and language switching

| Page | Spanish | Catalan |
| --- | --- | --- |
| Home | `/` | `/ca/` |
| Studio | `/estudio/` | `/ca/estudi/` |
| Projects | `/proyectos/` | `/ca/projectes/` |
| Project detail | `/proyectos/<id>/` | `/ca/projectes/<id>/` |
| Services | `/servicios/` | `/ca/serveis/` |
| Living Research | `/living-research/` | `/ca/living-research/` |
| Contact | `/contacto/` | `/ca/contacte/` |

The navbar’s ES/CA links preserve the current page and project ID. Navigation, footer and internal calls to action stay in the selected language. Links load a new document; there is no language persistence or browser-language redirect.

## Content ownership

- `src/i18n/locales.ts` enables ES/CA; `src/data/pages.ts` owns translated metadata and slugs. Published-page equivalents remain the source for language links and metadata.
- `src/data/localized/` separates typed Catalan copy by domain. Exact Spanish source-copy keys preserve the existing wording; components share the existing markup, styles and assets.
- `src/data/project-categories.ts` keeps all ten stored IDs unchanged and supplies complete Catalan labels. Unknown categories remain omitted; years are independent.
- Contact labels, alternatives, simulation feedback and validation are localized. The form still sends and stores nothing. Public names, addresses and contact destinations are unchanged.

## Live project policy

Both homes, lists and detail routes render server-side. Each route owner awaits data before rendering, sets all three no-store headers, and preserves sanitized 503 errors and missing/invalid detail 404s. Editorial siblings remain static. The catch-all excludes the explicit live routes.

Cards, detail content and detail metadata reuse the unchanged `selectPilotProjectContent(project, locale)`:

1. Use original content when the requested locale is the original language.
2. Otherwise use the requested translation only when **both title and description are nonblank**.
3. For absent or incomplete translations, use the **whole original title and description**, including nullable originals. Never mix fields, infer an original language or mutate the DTO.

This client policy does not change the shared exact-language selector, fetch/validation boundary, owner selection or API output. Project data never enables site languages.

## Metadata and verification

`BaseLayout.astro` continues to own document language/direction and metadata. When Astro’s real production `site` is configured, canonical and reciprocal hreflang links retain the localized detail ID; otherwise absolute SEO links are omitted. No production domain was invented.

Run `node --test tests/es-ca.test.mjs tests/project-categories.test.mjs`, followed by `corepack pnpm check`, `corepack pnpm build` and `corepack pnpm run validate`. Fixtures use public HTTP with fake upstream data, never live Supabase. They cover equivalent routes, dynamic refresh, complete/incomplete translations, metadata, categories and no-store errors.

Historical integrated validation (before subsequent fixture corrections): `corepack pnpm run validate` exited **1**; types/build passed (0 errors, 0 warnings, 2 existing numeric-literal hints), and **360/363 tests passed**, with no skips. Failures:

- `contact content renders truthful location, labels and a safe non-submitting demo`: missing standalone `Plano orientativo`, also recorded in the earlier brief/portfolio verification. Its assertion remains intact.
- `registry siblings and generic translations build statically without accessing projects`: old `= ['es'];` fixture replacement no longer matches the enabled ES/CA declaration.
- `full-document locale requests share local/UI and fresh project language`: the excluded helper’s old `['es']` replacement no longer matches.

The latter two are compatibility failures introduced by enabling Catalan, not environmental failures. Focused ES/CA coverage passed **7/7** during this full run, including HTTP refresh, fallback and error cases. Generic third-language, RTL, partial-publication and invalid-configuration tests passed. That run was a **partial verification handoff**, not a green delivery.

At that handoff, `tests/home-renderer.test.mjs` and `tests/helpers/localized-project-fixture.mjs` were excluded from the localization worker's edit authorization. Current source now explicitly replaces the ES/CA declaration with ES/EN for those generic fixtures; this supersedes the old missing-replacement diagnosis, but is not fresh execution proof. The cleanup worker leaves both files and all contact assertions untouched. Parent-owned validation must establish the current result; do not treat historical failures or totals as a current baseline.

Browser tooling was unavailable during implementation. Desktop/mobile appearance, keyboard navigation, font/image loading and visual accessibility still require real-browser review. Passing generated HTML checks would not provide that proof.

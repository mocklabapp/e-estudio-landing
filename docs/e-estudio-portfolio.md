# Preview the e estudio portfolio

The client showcase renders projects from the existing server-only `getProjects()` function. It does not introduce a CMS, direct database access or a second content source.

## Routes

- `/proyectos/` and `/ca/projectes/`: current public project list.
- `/proyectos/<id>/` and `/ca/projectes/<id>/`: stable decimal-string ID detail; unknown IDs return 404. Navbar language links retain the ID.
- Configuration/upstream failures return sanitized 503 pages.
- Both locales’ homes, lists and details set all three no-store headers on success and error. Dashboard updates appear on the next request without rebuilding.

The existing owner configuration remains unchanged. The consumer allowlist preserves public `images`, `category` and `year`. See [the integration guide](projects.md). Query parameters cannot select another owner. Project text is escaped; presentation uses the pilot-local selection policy below, not a changed shared data contract.

## ES/CA presentation

- **List:** first received image as the cover, selected title, translated category label when recognized and year when supplied. Cards link to the local detail; no shortened description is shown.
- **Detail:** compact title with recognized category label/year only when available, then the first image as the main visual. On large screens, descriptions of at most 600 characters, three paragraphs and eight source lines sit beside the image in a one-third column; longer narratives sit below at a readable width. Mobile always follows title, main image, description, remaining gallery. The full text and line breaks survive; nothing is summarized or assigned to invented stages. The corrected supplied sample remains in `tests/fixtures/pilot-project.ts`, including the complete VIDA paragraph.
- **Images:** the detail's main image loads eagerly, with a square frame beside short text or a 3:2 frame above long text. Remaining images load lazily in an adaptive grid (up to three columns), preserving received order and repeated URLs without adding another copy of the cover. A single image produces no empty gallery. Generic title/index alternatives retain the original total. Card covers crop to fit; detail images remain fully visible within their frames. No captions, narrative-stage assignments, carousel or client JavaScript are invented. Missing images use `MediaPlaceholder`.
- **Language approval (supersedes the initial Spanish pilot):** both ES/CA presentations use `selectPilotProjectContent(project, locale)` unchanged from T1. A selected translation is used only when title and description are both nonblank; otherwise the whole original title/description is shown. Original-language matches retain the original. No field mixing, DTO mutation or inference of an unknown original language occurs. Cards, detail and detail metadata use the same policy; the shared exact-language selector is unchanged. See [the localization guide](e-estudio-localization.md).

### Central category catalog

Home cards, portfolio cards and project details use the [shared typed catalog](projects.md#category-labels-and-options), not raw `category` strings. For example, `publico` displays as **Espacio público** in Spanish, **Espai públic** in Catalan and **Public space** in English. Labels follow the actual page locale (`Astro.currentLocale`, with the default for unprefixed Spanish); title/description selection follows the approved whole-original fallback. Spanish, Catalan and English category dictionaries are supplied; only Spanish and Catalan are enabled.

Unknown or missing categories and untranslated locales produce no category label. The year remains visible independently; absent category/year produce no empty metadata row or separator. Stored/API category values are unchanged. There are no existing category filters/selectors to connect; future consumers can obtain fresh `{ value, label }` options from `getProjectCategoryOptions(locale)` and filter by the stable value.

## Data and pending assets

The validated DTO now includes `images: Array<{ url: string }>`, `category: string | null` and `year: string | null` alongside title, description, link and language fields. Legacy responses without these fields normalize to `[]`, `null`, `null`. Images are validated against the configured Supabase origin's public `projects-images`/`user-media` buckets; raw image metadata is excluded.

The client components render the supplied media and list metadata without changing the data consumer, semantic tokens or fonts. Location, area and image-to-narrative-stage relationships remain outside this DTO and are not fabricated. No raw database payload is logged. Home uses the same ES/CA presentation policy; the shared exact-language selector remains unchanged. This local presentation work does not authorize deployment.

The supplied external project link is not rendered as a clickable URL in this preview. Navigation uses local detail URLs.

## Logging

Portfolio routes do not print project payloads or diagnostic warnings in development or production. Removing the temporary diagnostics does not change rendered content, HTTP statuses or no-store headers.

## Check

Category coverage: `node --test tests/project-categories.test.mjs tests/portfolio-pages.test.mjs tests/home-runtime.test.mjs` checks all ten Spanish/Catalan/English labels, exact IDs, null/no-fallback behavior, fresh options, actual English-page labels in all three renderers, unknown-category omission with year retention, and raw API category preservation. No browser verification or deployment is implied.

Run `node --test tests/pilot-project-content.test.mjs tests/portfolio-pages.test.mjs tests/portfolio-logging.test.mjs tests/project-content.test.mjs` for selector and isolated built-handler checks: first cover/list metadata, ordered repeated images, full supplied paragraphs, the approved project-selection policy with matching detail metadata, partial translations, escaped text, owner selection, live updates, logging, no-store, empty lists, invalid/missing IDs and sanitized failures. Fixtures use fake configuration and image URLs; they do not contact production Supabase or load remote images.

Run `corepack pnpm run validate` for types, build and the full suite. Real-browser responsive, image-loading and accessibility review is still unavailable; generated HTML tests are not visual proof.

Historical category catalog verification (before ES/CA): focused checks passed **18/18** and explicit strict TypeScript checking of the three touched test files passed with Astro's type declarations included. Full validation passed types (0 errors, 0 warnings, 2 existing hints) and build; **336/337** tests passed. The sole failure in that historical run was `contact content renders truthful location, labels and a safe non-submitting demo`, expecting a standalone `Plano orientativo` label outside this change. The canonical environment-template test passed in this run. No browser verification or deployment was performed.

### Earlier verification records

Image-led detail verification: focused portfolio checks passed **8/8**. Full validation passed type checking (0 errors, 0 warnings, 2 hints) and build; **321/323** tests passed. That run's two failures concerned the contact page's expected `Plano orientativo` label and the absent `.env.example`, outside this detail change. Browser visual verification remains unavailable; this is not a completed visual sign-off.

Earlier pilot implementation evidence: focused checks passed **17/17** (exit 0). Full validation passed types (0 errors, 0 warnings, 2 existing hints) and build; **311/312** tests passed (exit 1), with only `the canonical environment example is blank and distributable` failing in `tests/toolchain.test.mjs` because the template is intentionally absent. No deployment or old independent-verifier retry was performed.

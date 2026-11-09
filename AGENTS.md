# Working on e-estudio-landing

## Client maintenance and resumption

- This is the independent e estudio website, not a client generator. The intended destination is `https://github.com/mocklabapp/e-estudio-landing.git`; do not infer publication, remote changes or deployment authorization.
- Read [the handoff](docs/e-estudio-handoff.md), [the working brief](docs/project-brief.md) and [the change/release checklist](docs/project-kickoff.md). Resume the requested slice without restarting client discovery or overwriting existing work.
- Reuse approved design, palette, supplied artwork and ES/CA content. Ask only 1–3 relevant unresolved questions in the human's language, then wait. Record changed decisions separately from proposals and pending items; preserve historical evidence.
- Contact remains a no-send/no-storage demo; participation, signup and voting are excluded. Fonts remain provisional. Design approval does not authorize launch or live personal-data collection.
- Before modifying live portfolio access, read [the consumer contract and change checklist](docs/projects.md). Keep the fixed owner, public fields/states, ES/CA whole-original fallback and no-store behavior; never record credentials in documentation.
- Shared backend sources, SQL and exclusive service tests are maintained elsewhere. Do not recreate that backend or rerun a starter initializer in this client.

## Before changing code

- Read `README.md`, `package.json` and the files involved in the request.
- Confirm the goal, affected routes and acceptance criteria. Ask about unresolved product decisions.
- Preserve the existing structure. Do not add dependencies, integrations or services without a concrete requirement.

## Placement rules

- `src/pages/`: file-based routes and page composition.
- `src/layouts/`: document shell and shared metadata; use `BaseLayout.astro`.
- `src/components/ui/`: small reusable presentation components.
- `src/components/sections/`: complete page sections composed from smaller components.
- `src/components/shared/`: site-wide components shared across routes/sections, such as a header or footer; generic presentation primitives still belong in `ui/`.
- `src/components/<feature>/`: feature-specific presentation components when a domain needs its own cohesive group. Create new directories only when adding real files, not placeholders.
- `src/config/site.ts`: shared site identity; do not duplicate it in pages.
- `src/data/`: local content; `src/lib/`: non-visual shared utilities.
- `src/assets/`: processed imports; `public/`: unchanged public files.
- `src/styles/global.css`: Tailwind entry point and global base rules.
- `src/styles/tokens.css`: shared semantic theme tokens. Keep genuinely custom component CSS scoped to its Astro component.
- Use `@/` imports for files under `src/`. Keep TypeScript strict.

## Development methodology

### Componentization and responsibility boundaries

- Componentization is the default: break pages and substantial sections into cohesive native Astro components with one clear responsibility. Extract independently understandable presentation, repeated markup and reusable behavior instead of building monolithic pages. An extraction must improve structure or reuse, not merely wrap a few lines without a useful responsibility.
- Reuse existing components/functions before adding new ones. Keep routes and layouts focused on composition; UI components receive typed public data through props rather than perform business operations or fetch privileged data.
- Distinguish generic UI primitives, shared site-level components, complete sections and feature-specific pieces using the placement rules above. Keep feature details inside their owner; promote them to shared code only when they genuinely serve multiple consumers.
- Organize non-visual functions, data access and pure helpers by domain under `src/lib/`. Keep a cohesive module flat when sufficient; use `src/lib/<domain>/` when responsibilities need multiple files. Separate side effects from pure transformations/validation, and avoid catch-all `helpers.ts`, `functions.ts` or oversized shared modules containing unrelated behavior.
- Keep APIs small, names descriptive and dependencies explicit. Prefer composition, low coupling and one source of truth; preserve existing contracts, server/client boundaries and tested behavior when extracting code.

### Strict typing

- All authored code must be type-checked. Prefer TypeScript for logic, scripts and tests; keep strict mode enabled. Type Astro `Props`, function parameters/returns, exported contracts, domain models and component interactions. Reliable local type inference is welcome; redundant annotations are not required.
- Keep types close to their owning component/domain. Extract genuinely shared contracts into a focused module rather than duplicating them or creating a global dumping ground for every type.
- Treat external JSON, form input and API responses as `unknown` until validated and narrowed. Static interfaces do not replace runtime validation. Do not use `any`, unjustified assertions or error-suppression directives to bypass missing types or invalid data.
- If tooling requires JavaScript/MJS, use `@ts-check` and complete JSDoc types instead of leaving it unchecked. Do not introduce an untyped escape hatch merely to avoid TypeScript.

### File size and completion checks

- Keep each hand-authored code file at **300 physical lines maximum**, including comments and blank lines for consistent measurement. This covers source modules, Astro templates/styles, tests and code-based configuration. Split by responsibility before reaching the limit, not after a file becomes difficult to maintain.
- Exceed 300 lines only when there is no reasonable decomposition. Identify the exact file and explain why the alternatives would be worse in the change context before delivery; convenience is not a justification. Tool-generated files and lockfiles are not hand-authored code and must not be manually split.
- Never minify code, remove useful comments/tests or pack statements together to game the limit. Do not replace one oversized file with several unrelated or meaningless fragments.
- Before completing a code change, review component/module boundaries, touched-file line counts, types and applicable tests. Run the existing verification commands and preserve observable behavior through refactors. The current validation command does not automatically enforce the 300-line limit; perform that review explicitly and disclose any justified exception.

### Testing strategy

- Test observable behavior and meaningful contracts in proportion to risk, not the number of components or files. Componentization does not require one unit test per component/helper. Avoid arbitrary coverage quotas and assertions tied to incidental markup, whitespace or CSS classes unless they protect an explicit contract.
- Keep the existing Node test runner, generated-HTML checks and fixture-backed API/build tests. Do not add Vitest, Playwright or another test dependency merely because Astro supports it; introduce a tool only for a concrete testing need.
- For a simple static landing page, prioritize type checking, a successful build, focused checks of essential content/metadata and an affected-page browser review. Add unit/integration tests for important logic and data behavior: owner isolation, credential/private-field exclusion, validation, pagination, failure handling, translations, published routes and SEO metadata. Metadata tests do not prove search rankings or indexing.
- Add browser/end-to-end coverage when a critical interaction or user journey justifies it, such as a form, navigation flow or interactive filter. Builds and Node tests cannot establish responsive appearance, keyboard behavior, font loading or real-browser accessibility by themselves.
- Exercise public interfaces with isolated fixtures and fake credentials. Assert relevant outcomes and errors without depending on private storage or calling mutable production data. Prefer stable behavioral checks over broad snapshots of presentational details.
- For a deterministic behavior change with a clear expected result, observe a meaningful RED test before implementing GREEN, then run the focused checks and applicable suite. Refactors preserve existing regression checks; passive documentation or changes without a meaningful RED use proportionate structural checks with the limitation explained. Follow the [verification commands](#verification) and report failed, skipped or unavailable checks accurately.

## Styling rules

- The chosen stack is Tailwind CSS 4, semantic tokens and native Astro components. Do not replace it or add a UI framework by default.
- Preserve the approved e estudio anthracite/stone/sand/bone palette and supplied reference compositions recorded in the brief. New visual decisions need approval; do not restart palette selection or substitute starter defaults.
- Use semantic color utilities (`bg-canvas`, `text-ink`, `bg-brand`, `text-on-brand`, etc.). Define color values only in `src/styles/tokens.css`; do not introduce palette utilities or arbitrary color values in components.
- Use the shared spacing/type scales. Add justified project tokens centrally rather than repeating arbitrary values.
- Keep reusable variants inside native Astro UI components. Use complete static class names so Tailwind can detect them.
- Tailwind Preflight owns the reset. Do not add a competing reset. Check contrast and focus visibility for each approved client theme.

### Typography and font loading

- Current system stacks are Helvetica Neue/Helvetica/Arial sans and Bodoni MT/Didot/Times New Roman serif. They are provisional; no custom font is downloaded. Cormorant Garamond/Montserrat is a proposal only. Confirm families, roles, weights, ES/CA glyphs and rights in the brief before implementation.
- Define font stacks and justified shared type tokens in `src/styles/tokens.css`. Consume semantic utilities such as `font-sans`; do not hardcode families or arbitrary type values in components. Preserve the current serif/sans roles; any new role or family requires approval.
- For approved local fonts, prefer WOFF2 files in `src/assets/fonts/` and centralize `@font-face` declarations in `src/styles/fonts.css`, imported once by `global.css`. Create these files only when needed. Match face names to the token stacks; do not add external font requests, providers or dependencies without an approved requirement.
- Load only used weights/styles, retain compatible fallback fonts and use `font-display: swap` for custom faces. Preload only a justified critical font, not every file. Check loading, layout shifts and readability in a browser; a build does not verify font performance.
- Verify glyphs and real weights for every enabled language, including accents and RTL requirements when applicable. Do not infer that a Latin font or direction metadata guarantees multilingual typography.

## Multilingual contract

- Spanish is mandatory and unprefixed (`/`); approved Catalan is enabled at `/ca/`. English remains disabled. Native Astro i18n supplies localized routes without an i18n dependency; both homes and portfolios are on-demand, editorial siblings static.
- `src/i18n/locales.ts` owns the locale registry (human label, HTML language and `ltr`/`rtl` direction), derived `Locale` type, default and enabled list. Astro config and route generation consume that same list. Never disable Spanish or enable an unknown locale.
- Enable another language only after approval: preserve `es` and `ca`, register metadata, add complete approved UI and page translations, then enable it. Client-specific editorial/UI copy also needs domain translations under `src/data/localized/`; merely enabling a locale does not translate feature components. See the language guide.
- Stable page IDs connect translations; translate each page's slug, title, description and body. Every page requires Spanish. Optional languages may cover selected pages: omit an unavailable translation entirely. A provided published translation or enabled UI dictionary must be complete; builds fail instead of substituting Spanish. Never publish unapproved content or placeholders.
- `src/i18n/pages.ts` validates publication and maps equivalents. Colliding published output paths fail before static generation with `[i18n] Colliding published path <path>: <id>/<locale> and <id>/<locale>.` rather than silently dropping a page. `src/components/shared/PageRenderer.astro` owns shared composition. Explicit ES/CA Home routes own live data; `[...path].astro` handles static siblings and excludes explicit live routes. Reuse `BaseLayout.astro`, shared identity and styles; do not copy shells/components per locale.
- Nondefault routes are prefixed (currently `/ca/`) with translated slugs. Disabled languages generate no pages or links. No runtime translation, browser-language redirects or fallback URLs. `LanguageSwitcher.astro` uses only published equivalents of the current page and disappears without an alternative.
- Layout metadata uses the page language/direction and translated title/description. Set Astro's real production `site` before launch: absolute self canonicals and reciprocal hreflang (Spanish also `x-default`) are omitted without it. Never invent a client domain.
- For language changes, resolve affected coverage, translation readiness/approvers and metadata. ES/CA is already approved; the production domain remains pending. Page publication has no fallback; live project text separately uses the approved complete-translation-or-whole-original policy. Direction metadata supports RTL markup; RTL layout, fonts and real-browser review still require client-specific work.
- Run `pnpm run validate`: output checks and isolated public-build i18n/ES-CA tests cover enabled/optional/third languages, partial coverage, translated URLs, SEO and invalid publication/configuration. Do not claim browser or RTL visual verification from these tests.

See [the multilingual guide](docs/i18n.md) for configuration and translation examples.

## SEO and indexing

- **Current implementation:** `BaseLayout.astro` renders title, description, language/direction and, when Astro `site` is configured, self canonicals and reciprocal hreflang for published page equivalents (Spanish also `x-default`). This client has no production domain, sitemap, robots policy, social-card metadata or structured data configured; do not claim these are implemented.
- Keep shared identity in `src/config/site.ts`, translated page metadata in `src/data/pages.ts` and shared head rendering in `BaseLayout.astro`. Future data-driven pages must supply truthful page-specific metadata through the shared layout, not duplicate document shells or publish a different language's fallback copy.
- Before launch, obtain the real production origin and configure Astro `site` in `astro.config.mjs`. Never invent a domain or use fixture/preview/request-host values as the production canonical origin. Verify canonical URLs against actual routes and include only enabled, available equivalents in hreflang and any future sitemap.
- Resolve production/preview indexing intent and any migration redirects during kickoff. Do not assume previews should be indexed. When implementing exclusion, use an appropriate `noindex` meta/header that crawlers can read: `robots.txt` crawl blocking alone does not reliably prevent indexing and can hide `noindex`. Neither mechanism protects private content; private access requires authorization controls.
- For indexable portfolio pages, prefer on-demand server HTML using `getProjects()` with the existing no-store contract. The JSON endpoint or a client-only fetch is not itself an HTML portfolio page. Google can render JavaScript, but do not rely on that to supply essential content, links or metadata to every crawler. The explicit ES/CA detail routes retain project IDs and equivalents; project data alone never enables a locale or creates another language's route.
- Use descriptive page-specific titles/descriptions, a meaningful main heading and heading hierarchy, accessible image alternatives and crawlable `<a href>` links. Plan stable public URLs; return appropriate missing-content/error statuses rather than success pages containing only an error or placeholder. Do not promise rankings, indexing or rich results from metadata alone.
- Agree sitemap/robots behavior, social-card assets and any structured-data requirements per client before adding integrations. Any future sitemap must reflect actual canonical indexable pages; live project URLs must stay current without requiring content-only redeploys. Social metadata and structured data must use approved real assets/facts, never invented organizations, reviews, ratings or domains.
- For functional SEO changes, run `pnpm run validate` and inspect representative static/SSR HTML heads, content, links and HTTP statuses, including relevant locale/domain cases. Current tests cover existing metadata/i18n behavior, not unimplemented features, browser performance or real search indexing. Live crawler/Search Console checks require the real authorized deployment.

References: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) and [noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

## Public projects integration

- Read [docs/projects.md](docs/projects.md) before changing data access or composing a portfolio. `src/lib/projects.ts` exports server-only `getProjects()`; `/api/projects.json` is the dynamic public browser-consumption boundary. Do not add React just to create a hook.
- `MOCKLAB_USER_ID` fixes the site's displayed owner; no route/query/caller overrides. UID selects public output, not authorization; the shared service permits other public owner selectors. All project states are intentionally public. Return only `id`, `title`, `description`, `weblink`, `originalLanguage`, `translations` with `language`, `title`, `description`, plus `images` containing only `url`, and top-level nullable string `category` and `year`. Fetched projects normalize absent legacy additions to `[]`, `null` and `null`; present invalid additions fail closed. Image URLs must pass `src/lib/project-images.ts` validation for the configured Supabase origin and approved public buckets. Keywords remain excluded; never substitute `select(*)` or expose prompts, NAS paths or internal metadata.
- The externally maintained service owns database relations, owner selection and pagination. Preserve the DTO's null/partial content and unknown original language. The shared exact-language selector has no fallback; this client's `selectPilotProjectContent` uses complete translations or the whole original, never mixed fields or inferred Spanish. Data never enables site locales.
- Import `getProjects()` only in server modules/frontmatter, never client scripts. Routes using it must export `prerender = false`; keep Cache-Control, CDN-Cache-Control and Vercel-CDN-Cache-Control as no-store on success and failure. Static unrelated routes stay static; do not enable ISR or persistent data caching.
- Read only `MOCKLAB_PROJECTS_URL` and `MOCKLAB_USER_ID` at runtime through `getSecret`; delegate to `fetchPublicProjects()` without visitor input. Sites need no privileged/API key and have no legacy credential fallback. Keep the public allowlist and server-only consumer boundary. The human-owned blank template contains only those two assignments; never retrieve, commit, log or serialize credentials. Shared Edge target/grants, runtime/gateway proof and deployment remain separate operator gates; existing management-app grants are not silently revoked.
- Keep the narrow routing-utils/path-to-regexp 6.3.0 override with its compatibility test. The bundled-Zod advisory remains unresolved; do not hide it with a dependency-only override or blindly downgrade the adapter. See the guide's dependency limitation before any deployment decision.

## Implementation rules

- Prefer native Astro components and semantic, accessible HTML.
- Keep JavaScript off the client unless an interaction requires it.
- Do not add speculative abstractions or extract components that have no useful responsibility.
- Never commit secrets, generated output or dependency directories.
- Add or update focused tests when changing behavior. Update documentation when changing commands or structure.

## Verification

Use Node 24.x and the pinned pnpm 12.16.1 (`corepack pnpm` if a pnpm shim is unavailable). Install with `pnpm install --frozen-lockfile`; preserve `pnpm-lock.yaml` and the scoped override in `pnpm-workspace.yaml`. For code or configuration changes, run `pnpm run validate` before reporting completion. For tooling changes, also run `pnpm run check:tooling`: it preserves strict no-output checking of retained multilingual/build fixtures and package/toolchain tests, including imported helpers. The `validate` pipeline checks types, builds static pages plus the dynamic Vercel endpoint, and tests generated HTML, isolated multilingual builds and fixture-backed project/security/runtime behavior. Builds require no real secrets. Static output is in `dist/client/`; adapter deployment artifacts are in `.vercel/output/`. Project tests include public HTTP requests reflecting changed fixture data without rebuilding and client-import rejection. Report failed or skipped checks explicitly; do not claim browser verification from a successful build.

For documentation-only changes, check the changed instructions, local links/anchors and consistency with the actual code/tooling; do not rerun the functional suite when no behavior is affected. State that the suite was not run and why.

For visual or interaction changes, inspect the affected pages in a browser as well.

## Development server

Use `pnpm dev` interactively. Agents may start a managed server with `pnpm dev --background`; manage it with `pnpm astro dev status`, `pnpm astro dev logs` and `pnpm astro dev stop`.

`pnpm preview` is unsupported by this Vercel adapter. Use the development server for interactive local work; built-handler fixture tests are not live Supabase/Vercel deployment proof. See [the projects guide](docs/projects.md) for runtime boundaries and configuration.

Official documentation: https://docs.astro.build/

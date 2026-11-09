# e estudio — client preview brief

Source of truth for this client, based on the supplied final screens and subsequent explicit decisions. The original starter architecture remains the foundation; this checkout is now the e estudio client project.

## Resume in a new conversation

Read [the current handoff](e-estudio-handoff.md) first: implemented work, remaining client tasks, supplied assets, typography proposal, external service boundary and verification limits. Reconcile historical observations with current source and Git status; do not overwrite newer work.

## Approved scope

| Area | Decision and source |
| --- | --- |
| Identity | e estudio, residential architecture. User: “será la web de e-estudio”. |
| Purpose | Client demonstration and public showcase, not a management application. Intended independent repository: `https://github.com/mocklabapp/e-estudio-landing.git`; no publishing authorized. |
| Design | All seven supplied images are final design. Responsive adaptation follows the same composition. |
| Palette | Anthracite #1A1A1A, stone #A89F92, sand #D9D3C8, bone #F6F4EF from supplied brand board. Semantic foreground variants preserve readability. |
| Brand artwork and provisional fonts | Supplied original PNG artwork now replaces mocked logos: e estudio primary in header, typographic in footer, e living primary in Services; supplied favicons in the shared layout. Local Didot/Bodoni/Times and Helvetica/Arial stacks remain provisional; no font downloads or external requests. |
| Pages | Home, Estudio, Proyectos, project detail, Servicios, editorial Living Research, Contacto. |
| Projects | Existing Mocklab function with configured user UID remains the only project source. No duplicate project database or manually fabricated projects. |
| Home featured projects | Approved: real projects, the three most recent using highest numeric ID as the recency proxy, descending. Decimal-string bigint IDs retain full precision; the public API keeps its existing ascending order. |
| Contact | Form remains an explicit no-send/no-storage demo. Phone, email, Instagram and hours from the contact reference are definitive (user: “son definitivos”); approved details below. |
| Excluded | Participation, community signup and voting are out of budget and omitted, including dead calls to action. |
| Languages | Approved: Spanish default `/` and Catalan `/ca/`, full existing site/UI translation and navbar ES/CA equivalent-page links, retaining project IDs. English stays disabled. Projects use a complete selected-language translation or the whole original; incomplete translations never mix fields. See [localization](e-estudio-localization.md). |
| Images | Contact facade and interior supplied and approved; served from `public/contact/facade.png` and `public/contact/interior.png`. Living Research now uses 11 supplied clean reference crops in `public/living-research/`, with intermediate fidelity approved. Home uses the two approved unchanged `home-images` editorial crops in `public/home/`; its featured photographs come only from real project records, not the supplied project screenshot crops. Studio founders/team/room photographs and collaborator artwork, plus Services habitar/promover images, are also applied from `public/studio/` and `public/services/`. Higher-resolution originals and browser fidelity remain review items; no fabricated project photography. |

## Implementation slice

Status: **implemented client preview; verification and release gates remain open**. Initial provisional implementation was authorized by “mientras saco ese contenido ve avanzando tú”; subsequent approved assets and ES/CA work are recorded below. This is not launch approval.

- Reuse Astro, strict TypeScript, semantic Tailwind tokens and shared BaseLayout metadata.
- Compose reusable shared/UI/section components; keep code files at 300 lines maximum.
- Keep the validated public consumer boundary: the DTO now includes ordered image URLs, nullable category and string year. Cards, detail galleries and latest-three Home projects use them. Location, area, credits and narrative-stage associations are not exposed or invented.
- Project list/detail use on-demand server HTML and no-store headers, with safe empty/error/missing-content states.
- Do not log raw database payloads or private fields. The temporary development log has been removed at the user's request; portfolio requests emit no project payload or diagnostic warning in development or production. A previous local API check returned HTTP 200 and four projects; this historical observation is not a current service check or hosted deployment proof.
- Verify with types, build, public-interface fixtures and browser review where available. Record limitations rather than claiming visual fidelity while assets are absent.

## Pending inputs and decisions

| Pending item | Effect |
| --- | --- |
| Browser-check applied artwork; confirm font files and rights | Seven unchanged production assets from the supplied brand-assets folder are applied in `public/brand/`, preserving alpha/aspect ratios without enlarging logos beyond their native dimensions. Browser fidelity remains unverified. Cormorant Garamond/Montserrat pairing is feasible, not installed; original vectors remain preferable. |
| Applied editorial assets | Home, Studio/team/collaborators, Services, Research and Contact images are in use. Check responsive fidelity; higher-resolution originals may still be preferable. |
| External public service and additional technical fields | Rich image/category/year consumption is implemented. Shared backend maintenance and rollout belong elsewhere; no local fixture proves hosted grants or service deployment. Any additional public fields need separate approval. |
| e living destination and any service-detail destinations | No invented URL or additional property website. Use existing contact path where appropriate. |
| Contact legal copy and any future real form submission | No fake privacy link or live submission. Contact details and Google Maps location are approved below. |
| Domain, hosting, indexing and final launch owner | Separate future launch approval. ES/CA source translation is approved, not publication. |
| Environment disposition | Earlier intentional template deletion and test failures are historical evidence below; later runs reported the template test passing. Do not infer current filesystem state or restore/read/change environment files from those records. Preserve the unchanged semantic security test and report fresh results. |

## Acceptance and remaining proof

All intended Spanish and Catalan navigation destinations must work, the mock form must not send or store data, and excluded participation/voting controls must be absent. Existing locale and public API behavior must remain intact. Final screenshots, responsive appearance, font rendering and keyboard interaction require real-browser review; a build alone is not that proof.

## Separate permissions

- Source implementation and local work-unit commits on the feature branch: authorized.
- Initializer/history rewrite, publication, deployment, embedded external services, and live personal-data collection: **not authorized**. The contact plan links out to Google Maps for directions; it does not load Google inside the page.
- Environment files and unrelated edits remain untouched. Earlier template disposition is historical, not an instruction to delete or restore any file.

## Decision record

Current repository ownership decision: maintain this as `e-estudio-landing`; shared Supabase backend/SQL and exclusive service tests are maintained elsewhere and removed here by the parent. Preserve the web consumer, configuration names, security tests and historical task records. See [repository cleanup](../odd/tasks/e-estudio-repository-cleanup.md).

1. Final reference screens and e estudio client identity confirmed.
2. Mocklab owns projects; website is a showcase.
3. Contact is mocked; participation/voting removed as not budgeted.
4. User authorizes progress with mocked logos and visually similar provisional fonts while original materials are prepared.
5. Contact reference update approved: supplied `facade.png` and `interior.png`, with the location at **Plaça de l’Església, 23, 08440 Cardedeu, Barcelona**. The facade reaches the right edge; the bottom interior/map row spans the page and stacks on narrow screens. Shared header/footer, palette and provisional fonts stay unchanged.
6. Contact details confirmed definitive: **+34 615 123 456**, **hola@eestudiohabitar.com**, Instagram **@e_estudio_habitar**, **De lunes a viernes 9:00–18:00**, **Con cita previa.** These are public contact links, not a live form authorization.
7. The initial Google Maps embed is superseded by the approved illustrated plan (user: “Vale, plan ilustrado”). Use a bone background, understated streets, existing studio typography and a bespoke marker, with Ayuntamiento de Cardedeu, El Melindró and Plaça de l’Església as landmarks. Label it **Plano orientativo**, without scale or precise-cartography claims, and link to Google Maps directions for the exact address. Native inline SVG only: no Google embed, external assets, API key or third-party request until the visitor follows the directions link.

8. Living Research visual slice approved: “al menos que tenga las imágenes e intentar llegar a lo que se pide, no hace falta un pixel perfect pero algo intermedio seguro que si podemos hacer”. Supplied `living-images` assets replace Research placeholders only: split hero, four models, three exact questions, meeting banner, text with five method steps, community row and page-local sunset contact band. Existing copy, palette, provisional fonts and shared shell remain unchanged. No participation, signup, voting, event dates or dead CTAs are reintroduced. Hero/sunset use clean partial crops, not the versions with baked text/buttons; the sunset sits beside live HTML copy rather than inventing a panoramic background. [Asset dimensions and limitations](../public/living-research/README.md).

9. User requests sitewide application of `/Users/miguelangellucenaaguilar/Desktop/brand-assets`, replacing recreated marks rather than redesigning the site. Header/footer and Services now use the supplied PNG letterforms; all shared-layout routes use the supplied favicon artwork, including a white dark-chrome variant. Logo widths are capped at 236 CSS px (primary) and 174 CSS px (compact); original files, navigation, palette and provisional fonts are preserved. No contact sheet, asset manifest or unused artwork is published.

### Living Research verification

Historical slice evidence, retained without replacing it with current-suite claims:

- Node 24.22.1 / pnpm 12.16.1. `node --test tests/editorial-pages.test.mjs`: RED **9 passed / 3 failed**, then GREEN **12/12 passed**, including image delivery/dimensions, preserved copy, ordered sections and sibling-page contracts.
- `corepack pnpm run validate`: types/build passed (**0 errors, 0 warnings, 2 existing numeric-literal hints**); **314 tests, 312 passed, 2 failed, 0 skipped**. Failures: `contact content renders truthful location, labels and a safe non-submitting demo` (visible “Plano orientativo” label missing in out-of-scope Contacto) and `the canonical environment example is blank and distributable` (intentional missing `.env.example`). Neither unrelated surface was changed or its test weakened.
- No browser tool is exposed in this worker session: desktop/mobile appearance, keyboard/focus, zoom and screenshot fidelity remain unverified. The asset contact sheet was inspected, not a browser screenshot. Global validation remains failing; this is not a fully verified delivery or launch approval.

### Home reference implementation

- Approved Home sequence: centered title/subtitle and studio link, two editorial image columns, latest-three real projects, then a sand conversation band. Native responsive sections preserve the shared header/footer, palette and provisional fonts. [Home asset provenance and limitations](../public/home/README.md).
- `/` now renders on demand through server-only `getProjects()` with all three no-store headers. Subsequent requests reflect data changes without rebuilding; open tabs do not poll. All intentionally public states remain eligible. Empty results show truthful copy and a portfolio link; unavailable data returns sanitized HTTP 503 with the same navigation and no raw logs.
- Home cards use the existing pilot content-selection policy and validated first image, with category/year only when provided. No location/date is inferred. Highest IDs are compared as `BigInt`, never converted to JavaScript numbers; sorting a copied array leaves the API contract untouched.
- `src/components/shared/PageRenderer.astro` owns registry rendering. The ES/CA implementation now gives both `/` and `/ca/` live Home data; `[...path].astro` remains static for editorial siblings and generic optional translations, excluding explicit live routes. Metadata and equivalent-language links retain the shared registry. This supersedes older source-map references that place shared rendering in `index.astro`.
- Browser tooling is unavailable in this worker session. Screenshot fidelity, mobile/desktop layout, zoom, keyboard focus and actual font/image loading remain pending; structural HTML checks are not visual sign-off.

### Home verification

- Meaningful RED: **11 passed / 4 failed**, including absent latest-three cards. Final `node --test tests/home*.test.mjs tests/editorial-pages.test.mjs`: **20/20 passed**. HTTP fixtures cover five records with bigint IDs above JavaScript's safe-integer limit, updates without rebuild, unchanged ascending API order, all-state eligibility, missing content/media, empty/unavailable responses and all three no-store headers.
- `node --test tests/brand-assets.test.mjs`: **7/7 passed**. Existing branding, shell, identity and styling assertions now read real SSR Home HTML instead of assuming a static root file. A one-off renderer differential found identical HTML and CSS contents for seven unaffected registered routes; only generated stylesheet filenames differed. No historical baseline remains in permanent tests.
- Historical Home integration `corepack pnpm run validate`: types/build passed (**0 errors, 0 warnings, 2 existing hints**); **331 tests, 330 passed, 1 failed, 0 skipped**. Only `contact content renders truthful location, labels and a safe non-submitting demo` failed on the already-known visible “Plano orientativo” assertion. The environment-template test failed in an earlier run but passed in this final run; this Home work did not inspect, restore or modify environment files. Contact and its test remain untouched. This is not a fully green global suite or launch approval.

Implementation tracking and exact quotes: [e estudio preview tasks](../odd/tasks/e-estudio-preview.md) and [Home tasks](../odd/tasks/e-estudio-home.md).

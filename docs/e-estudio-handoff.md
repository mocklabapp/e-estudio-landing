# Resume the e estudio client preview

This is the independent **e-estudio-landing** client preview, **not a visually finished or fully independently verified website**. ES/CA, supplied branding/editorial images and rich portfolio presentation are implemented. Final typography, browser fidelity and release gates remain open. Intended destination: `https://github.com/mocklabapp/e-estudio-landing.git`; no publication is claimed or authorized. Historical verification and Git notes below are dated evidence, not the current working-tree inventory.

## Start here

1. Read `AGENTS.md`, this file, [the client brief](project-brief.md) and [the feature tasks/log](../odd/tasks/e-estudio-preview.md).
2. Read the relevant [Home](../odd/tasks/e-estudio-home.md), [ES/CA](../odd/tasks/e-estudio-es-ca.md) and [cleanup](../odd/tasks/e-estudio-repository-cleanup.md) task records. Reconcile historical evidence with current files and Git status; preserve newer work.
3. Shared backend maintenance is external. This repository retains only the web consumer and its controls; do not recreate SQL/Edge sources here.
4. Confirm the requested client slice using [the change/release checklist](project-kickoff.md). Reading this handoff does not authorize deployment, sensitive operations or retrying a previously blocked verifier.

## Approved scope and decisions

- Client: **e estudio**, residential architecture. This checkout becomes its website; it is no longer a blank starter.
- All seven supplied brand/page images are the **final visual direction**, not suggestions to redesign.
- Required compositions: Home, Estudio, project listing, project detail, Servicios, editorial Living Research and Contacto.
- Site is a showcase; Mocklab manages projects. No second CMS or duplicated manually maintained project database.
- Contact is explicitly a **mock for a client proof**. No messages sent, data saved or backend recipient configured.
- Participation, community signup and voting are **excluded as not budgeted**. Do not reintroduce their controls or dead links.
- Spanish `/` and Catalan `/ca/` are enabled with translated UI/editorial copy and equivalent-page navigation, retaining project IDs. English remains disabled.
- Initial implementation was authorized with provisional logos, similar system fonts and honest pending-image panels.
- No push, publication, deployment, initializer/history rewrite or live personal-data collection was authorized.
- Never inspect or print environment files or credentials. The earlier intentional template deletion and failures below are historical; later runs reported that test passing. Do not infer present state or delete/restore files from those records. Keep the semantic test intact and report current verification separately.

## Implemented so far

| Area | Current implementation |
| --- | --- |
| Shared shell | Header, navigation, mobile native details menu, footer, skip link and shared primitives. Supplied e estudio primary header and compact typographic footer artwork; branded document icons on all routes. |
| Visual foundation | Approved palette through semantic tokens; provisional Didot/Bodoni/Times and Helvetica/Arial system stacks. |
| Editorial pages | Home has two supplied editorial crops and latest-three real projects. Studio uses founders/team/room photos and collaborator artwork; Services has habitar/promover imagery. Research uses 11 clean crops, exact questions, five-step method, community row and sunset contact band; no voting/participation. |
| Contact | Approved location, phone/email/Instagram/hours, facade/interior images and native illustrated plan linking out to directions. ES/CA validation and explicit simulation; no submission/network/storage. |
| Portfolio | ES/CA homes, lists and ID details use server-only `getProjects()`, rich images/category/year, whole-original fallback and no-store on success/error. Empty/unavailable/not-found states remain truthful. |
| Diagnostics | Temporary portfolio logging has been removed at the user's request. Success and failure emit no project payload or diagnostic warning in development or production. |
| Local service | A prior observation returned HTTP 200 and four projects; this is historical, not current live-service or deployment proof. |
| Locale contracts | `PageRenderer.astro` handles five client page IDs in ES/CA; other registered pages/locales retain generic rendering. Explicit live routes own requests; editorial siblings stay static. |

An implementation task marked done means that provisional code and its applicable checks were observed; it does **not** mean final photographs, exact typography or browser fidelity are complete.

## Supplied brand artwork applied

Directory supplied by the human:
`/Users/miguelangellucenaaguilar/Desktop/brand-assets`

The user authorized applying this folder sitewide. Seven production files are copied unchanged into `public/brand/`: dark e estudio primary/typographic PNGs, dark e living primary PNG, `favicon.ico`, `favicon-32.png`, `favicon-white-32.png` and `favicon-180.png`. Original files are preserved. The review contact sheet, manifest and unused variants are not published.

Available:
- `e-estudio-primary-{dark,white}.png` and corresponding e-living logos.
- Typographic wordmarks for both brands, dark/white variants.
- `monogram-{dark,white}.png`.
- `favicon.ico`, PNG sizes 16/32/48/180/192/512, and sand/dark/light-circle tiles.

Limitations:
- Raster extractions from the supplied flattened brand board, not original vector artwork.
- Primary logos are 473 × 153 px. Avoid unnecessary enlargement; approximately 236 CSS px preserves a 2× pixel budget.
- The 512 px favicon is interpolated, not newly recovered detail.
- No installable fonts, font licenses, studio/team/editorial photographs or project images are included.
- The contact sheet is for review, not a production image.

Current usage: dark e estudio primary logo in the light header, dark typographic e estudio artwork in the footer and dark e living primary in Services. `BrandMark` retains its `variant` and `compact` props; compact estudio selects the typographic artwork. Primary marks display at up to 236 CSS px and compact marks at 174 CSS px, retaining native aspect ratios and alpha. Existing footer copyright remains plain text, not a recreated logo. `BaseLayout` supplies an ICO fallback, dark 32 px PNG, white 32 px PNG for dark browser chrome and 180 px touch icon. Generic starter favicons have been removed; layout references use the supplied `public/brand/` artwork. Palette and system font stacks are unchanged; no fonts were supplied or installed.

## Typography proposal — feasible, not installed

User asked to confirm:
> Principal: cercana a Cormorant Garamond Regular.
> Complementaria: sans geométrica fina; Montserrat Light sería una alternativa similar.

Response: viable approximation, not an exact identification. Proposed roles:
- Cormorant Garamond 400 for serif editorial headings.
- Montserrat 300 for sans display headings.
- Montserrat 400 for smaller body/navigation/form text where readability needs it.

Still pending: final confirmation, appropriate font files/source/licensing, local loading implementation and browser checks of glyphs/line wrapping. No font download or external request has been introduced. Keep the serif/sans roles of the approved screens, not one heading font indiscriminately.

## Public portfolio consumer and external service ownership

Historical ownership decision:
> esto quiero hacerlo en el proeycto base, dame el prompt para resolverlo en la conversación correspondiente

The compatible rich consumer is now present locally. The later cleanup decision confirms that shared backend/SQL and exclusive tests are maintained outside this website. No shared-service deployment is inferred from local implementation.

Current fields are `id`, nullable `title`, `description`, `weblink`, `originalLanguage`, `translations` containing `language/title/description`, ordered `images` containing only `url`, and nullable string `category/year`. Legacy missing additions normalize to `[]`/`null`/`null`. Public image URLs are validated against the configured Supabase origin and approved buckets; invalid present data fails closed.

Local owners are `src/lib/projects.ts`, `projects-client.ts`, `projects-response.ts` and `project-images.ts`. Keep fixed-owner runtime configuration, credential-free requests, private-field exclusion, no-store responses and sanitized errors. See [the complete consumer contract](projects.md) and [transport guarantees](projects-client.md); shared grants, gateway and rollout need external operator proof.

Cards/details now render real images/category/year and full descriptions; Home selects the three highest numeric IDs without losing bigint precision. ES/CA uses complete selected translations or whole original content through `selectPilotProjectContent`; the shared exact-language helper is unchanged. Unknown original language is never inferred as Spanish. Persona/Deseo, Proyecto, Obra and Vida remain narrative text, not fabricated structured stages or image associations. Location, area, state labels and credits are not invented or exported as new DTO fields.

## Remaining client work

| Task | Dependency / current status |
| --- | --- |
| Review applied logos/favicon in browser | Supplied artwork is integrated; responsive appearance and browser icon selection still need visual review. Original vectors remain preferable for larger use. |
| Apply chosen fonts | Proposed pairing only; obtain/confirm appropriate files and roles. |
| Review applied editorial photography | Home, Studio/team/collaborators, Services, Research and Contact assets are applied. Check responsive crops/resolution; higher-resolution originals may still be needed. |
| Review rich portfolio and featured projects | Consumer/rendering and ES/CA policy are implemented; verify real authorized service data and browser image loading without inventing missing fields. |
| Confirm e living and service-detail destinations | Current CTAs use Contacto; do not invent URLs or a second website. |
| Resolve contact legal material and any future collection | Public phone/email/Instagram/hours and illustrated plan are approved and applied. No third-party map embed; live form integration remains separately gated. |
| Compare desktop/mobile with final screenshots | Browser appearance, keyboard/focus, contrast and font loading remain unverified. |
| Complete independent shared-renderer verification | Prior setup failed before tests; see restrictions below. |

The original reference screenshots were attached to the conversation, not saved as standalone source files by this session. The feature log contains key copy/palette/composition evidence, but if exact visual comparison requires the original attachments in a new session, request them; do not assume those images are present in the repository.

## Living Research visual slice

The human approved intermediate fidelity, not pixel perfection, using the supplied
`living-images` directory. Eleven unchanged clean PNG crops now live in
[`public/living-research/`](../public/living-research/README.md). Hero and sunset
are partial text-free details; no baked text/button variants were copied. Dimensions
range from 164 × 145 px model cards to the 743 × 90 px meeting strip; the hero is
343 × 328 px and sunset 280 × 199 px. Responsive enlargement cannot restore detail.

`ResearchPage.astro` composes native imagery, four models and three exact questions;
page-local `research/` components own the method/community and sunset closing.
The method has copy left and five ordered steps right. The sunset sits beside live
HTML copy, avoiding an exaggerated full-width crop. All layouts stack on narrow
screens. Shared header/footer, ContactBand, fonts, palette, data contracts and
sibling editorial pages are unchanged. No forms, signup, voting, dates or dead CTAs.

## Verification evidence and limits

The following records are historical. Later [Home evidence](project-brief.md#home-verification) and [localization evidence](e-estudio-localization.md#metadata-and-verification) supersede their suite totals. Cleanup's focused package test and parent-owned full validation must be reported separately; no current green suite or browser review is claimed here.

Historical Living Research commands (Node 24.22.1, pnpm 12.16.1):
- `node --test tests/editorial-pages.test.mjs`: RED **9 passed / 3 failed** for absent native photos; GREEN **12/12 passed** after implementation. Includes all eleven delivered PNG dimensions/alt/loading, exact questions/method, section order, safe links and unchanged sibling media expectations.
- `corepack pnpm run validate`: types/build passed, **0 errors / 0 warnings / 2 pre-existing numeric-literal hints**; **314 tests, 312 passed, 2 failed, 0 skipped**.
- Failures: `contact content renders truthful location, labels and a safe non-submitting demo` (`tests/contact-preview.test.mjs:96`, expects a visible standalone “Plano orientativo” label); `the canonical environment example is blank and distributable` (intentional missing `.env.example`). Contact source/tests and environment disposition were not modified by this slice. Global verification remains failing.
- Browser tools were not exposed to this worker. The supplied asset contact sheet was inspected, but no rendered-page screenshot, responsive/zoom, keyboard/focus or font-loading proof was obtained. Intermediate composition is implemented, not visually approved.
- No prior independent-verifier retry, publication, deployment or commit was performed.

Earlier diagnostic evidence, retained for context (not the latest suite totals):
- `node --test tests/portfolio-logging.test.mjs`: **2/2 passed**, after observing RED first.
- `corepack pnpm run validate`: types/build passed; **242 tests, 241 passed, 1 failed, 0 skipped**.
- Only failing test: `tests/toolchain.test.mjs`, canonical blank `.env.example` missing. Intentional user disposition; no restoration or weakening performed.
- `git diff --check`: passed.
- Hand-authored changed code files were checked under 300 lines. Latest route/log test: 42/77 lines.
- No real-browser review, hosted deployment verification or visual completion claim.

Independent verifier `mw8agdja-6-orbv`:
- Required for item-3 risk in the shared renderer; native assessment of integration slice said `reviewDue=false`, `independentVerifier=true`.
- Its snapshot preparation was rejected by a sensitive-path guard because an exclusion expression named `.env`.
- **Zero test/build/check probes ran.** Structural inspection found no candidate-caused blocker but does not replace execution evidence.
- This is a preparation failure, not a proven unavailable verifier capability. No automatic retry or permission bypass. A new explicit human-directed attempt requires safe preparation and current consent; preserve prior evidence/budgets.
- All session subagents were confirmed completed before this handoff. None is active or uncertain.

## Historical working tree and local commits

Recorded branch: `feat/e-estudio-preview`. No push/deployment recorded. This table and the original inventory below are provenance, not instructions to restore old bytes or the current working-tree baseline. Inspect fresh status before any change.

| Commit | Work unit |
| --- | --- |
| `0477f2d` | Provisional brand and shared shell. |
| `a850c5e` | Live public portfolio routes. |
| `916c9d8` | Non-sending contact demonstration. |
| `3f0bd7b` | Editorial compositions and tests. |
| `8eee7f6` | Client route integration preserving locale renderer. |
| `f6a4411` | Verification evidence and blockers. |

Uncommitted before writing this handoff: `src/pages/proyectos/index.astro`, new `tests/portfolio-logging.test.mjs`, `docs/e-estudio-portfolio.md`, `docs/project-brief.md`, `odd/tasks/e-estudio-preview.md`; intentional `.env.example` deletion. This handoff and its links add documentation edits. Preserve all of these; do not reset/clean or blanket-restore files.

## Local preview and recommended next slice

Last known preview: `http://localhost:4321`. The managed server pre-existed this work; do not blindly stop it. Check current state with `corepack pnpm astro dev status`; use `corepack pnpm astro dev logs` for development logs. Do not assume a previous process remains alive in a new session.

Recommended next client slice: **confirm typography files, roles and rights**, then review the applied artwork, editorial photographs and rich portfolio in a browser. Repository cleanup still needs parent-owned full validation and independent tooling verification (risk item 5). These are recommendations, not new permission to retry the historical verifier, publish, deploy, change shared services or access secrets.

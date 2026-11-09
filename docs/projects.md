# Use live public portfolio data

e estudio consumes the externally maintained Mocklab public-project service through server-only `getProjects()` and dynamic public `GET /api/projects.json`. ES/CA homes and portfolios render this data on demand; editorial siblings remain static. Native Astro frontmatter needs no React hook, Supabase SDK or direct database access. [Presentation](e-estudio-portfolio.md) is separate from this consumer contract.

## Configure one portfolio

1. For live Home/portfolio data, the human configures the shared public Edge URL and owner UUID locally through the server runtime environment. Preserve any existing local configuration; do not retrieve, log or overwrite environment files. The site needs no API key or database credential. Both values are read through the server-only boundary.
2. Follow the [README quick start](../README.md#quick-start): Node 24.x, available Corepack and pinned pnpm 12.16.1; explicitly run `corepack pnpm install --frozen-lockfile`, then `corepack pnpm dev`. Static pages, checks, builds and tests need no credentials. The projects endpoint fails closed until all values are valid.
3. Before an authorized Vercel deployment, configure the same variables separately for each intended environment. Do not deploy merely to test configuration.

| Variable | Local and Vercel treatment |
| --- | --- |
| `MOCKLAB_PROJECTS_URL` | Exact `https://<20-character-project-ref>.supabase.co/functions/v1/public-projects` URL; no port, credentials, trailing slash, extra path, query or fragment. No production default is supplied. |
| `MOCKLAB_USER_ID` | One public owner UUID; never taken from browser/query input. |

The retained semantic security test expects a distributable template with exactly these blank assignments (comments and legal whitespace are allowed). This documents the contract, not permission to read, restore or change an environment file:

```dotenv
MOCKLAB_PROJECTS_URL=
MOCKLAB_USER_ID=
```

The `MOCKLAB_` prefix identifies the existing service integration and remains unchanged by this repository's rename. It neither selects a new deployment target nor authorizes remote changes. Old site variable names are not accepted as a fallback.

Migration from direct database access requires an operator to remove obsolete site `SUPABASE_URL`/`SUPABASE_SECRET_KEY` configuration; there is no fallback. Do not give sites `SUPABASE_ANON_KEY` or `PUBLIC_PROJECTS_ROLE_JWT` either. The shared Edge service alone owns restricted database access and pagination. Never commit local `.env` files or put credentials in source, HTML, props or browser bundles.

UID is a public selector, **not authorization**: callers of the shared service can select any owner's public output. The site fixes one configured owner for presentation, not private tenant isolation. Shared backend code, SQL, grants and exclusive service tests are maintained outside this repository. Local consumer validation does not deploy a function, revoke management-app access or establish global database hardening.

### External service contract and release gates

| Boundary | Consumer requirement / external responsibility |
| --- | --- |
| Request | One credential-free HTTPS GET to the configured `/functions/v1/public-projects` endpoint, with only a normalized `uid` query parameter; no Authorization/API key. |
| Success | HTTP 200 `{projects: [...]}` containing the complete public portfolio in strictly increasing positive signed-bigint ID order. Empty portfolios use `[]`; all states are intentionally public. |
| Selection and pagination | The external service selects the requested public owner and exhausts database pagination. It must not return knowingly partial success. The owner-free DTO cannot independently prove ownership at the site. |
| Invalid/unavailable data | Non-200, redirects, timeouts and invalid envelopes fail closed at the consumer with a sanitized unavailable result, never raw service details. |
| Deployment proof | The external operator verifies the intended service target, restricted export/role grants, native runtime, gateway access and any CORS policy. Site fixtures do not prove those controls. |

This website accesses Edge server-to-server; browser consumers use the same-origin site endpoint. Hosted Supabase/Vercel configuration, permissions and rollout require separate authorization and live evidence. Do not recreate operator SQL or service administration in this repository.

## Consume in native Astro frontmatter

Use this pattern in a future approved on-demand route (for example its index and rest route), reusing the shared shell. Register approved local page equivalents first, following [the language guide](i18n.md). This is a tested shared exact-language composition example, not the client's whole-original fallback policy or a newly enabled route:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.astro';
import { publishedPages } from '@/i18n/pages';
import { getProjects, type PublicProject } from '@/lib/projects';
import { selectProjectContent } from '@/lib/project-content';

export const prerender = false;

// Apply to success AND failure responses from any page using live data.
for (const name of ['Cache-Control', 'CDN-Cache-Control', 'Vercel-CDN-Cache-Control']) {
  Astro.response.headers.set(name, 'no-store');
}
const page = publishedPages().find(({ path }) => path === Astro.url.pathname);
if (!page) {
  return new Response('Not found', { status: 404, headers: Astro.response.headers });
}
let projects: PublicProject[] = [];
let unavailable = false;
try {
  projects = await getProjects();
} catch {
  unavailable = true;
  Astro.response.status = 503;
}
---
<BaseLayout page={page} title={page.content.title} description={page.content.description}>
  <main>
    <h1>{page.content.title}</h1>
    <p>{page.content.body}</p>
    <LanguageSwitcher page={page} />
    {unavailable ? <p>Projects unavailable</p> : projects.map((project) => {
      const text = selectProjectContent(project, page.locale);
      return <article data-content-source={text.source}>
        {text.source === 'missing' ? null : <>
          {text.title !== null && <h2>{text.title}</h2>}
          {text.description !== null && <p>{text.description}</p>}
        </>}
      </article>;
    })}
  </main>
</BaseLayout>
```

The **route** must export `prerender = false`; importing the function inside a component does not change the parent route's rendering mode. Calling it from a prerendered page would fetch at build time, defeating live updates and potentially requiring build credentials. Existing ES/CA homes and portfolios already render on demand; unrelated editorial pages remain static. Keep these three no-store headers on any SSR page that renders live portfolio data, including its error response; `getProjects()` cannot set the calling page's headers for you.

### One route language for both content sources

Local copy lives in typed `src/data/pages.ts`, not JSON; no migration is needed. The URL lookup above supplies **one `page.locale`** for local body, UI, metadata and project selection. `LanguageSwitcher` uses ordinary equivalent-page anchors: following one loads a complete new document and fetches current projects again. No SPA router, language persistence, automatic translation or open-tab refresh is added.

`selectProjectContent(project, language)` is pure and imports only the `PublicProject` type, never server-only runtime code. It returns `{ language, source, title, description }`: exact original matches win, otherwise an exact translation is selected; absence returns `source: 'missing'` with both fields null. Unknown original language is not Spanish. Partial selected fields stay null; there is no per-field fallback, trimming or synthesis. Arbitrary exact keys are supported, but this does **not** extend the database validator or publish site locales.

The example explicitly renders no text for `missing`, leaving an empty article marker; it does not discard the DTO. Choose the client's approved absence/partial/error presentation in their copy. The fixed sanitized 503 message is a technical example, not approved translated client UI. Do not mix missing fields from originals or leak error details. The current e estudio presentation instead selects a complete translation or the whole original through `selectPilotProjectContent`; preserve that explicit approved policy rather than replacing it with this example. An unavailable localized page returns 404 rather than another language's content. Existing routes that do not use live projects remain static.

Import `getProjects()` only in server frontmatter or server modules. Never import it in an Astro `<script>` or other browser module: its `astro:env/server` dependency causes Astro to reject client builds. The pure `selectProjectContent()` helper does not import that server-only runtime. A React-style client hook is unnecessary in this native-component stack.

## Consume from the browser

A custom browser component can call the public endpoint without any Supabase credentials:

```js
async function loadProjects() {
  const response = await fetch('/api/projects.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Projects unavailable');
  const { projects } = await response.json();
  return projects;
}
```

Success is `200` with `{ "projects": [...] }`; an empty portfolio returns an empty array. Missing/invalid configuration, upstream errors, timeout or invalid data return `503` with `{ "error": "Projects unavailable" }`. All endpoint responses set `Cache-Control`, `CDN-Cache-Control` and `Vercel-CDN-Cache-Control` to `no-store`. Query parameters cannot change the owner or upstream URL; no key is used. The endpoint is intentionally public, not authenticated; every returned field must be approved for public distribution. Render text safely rather than injecting descriptions as raw HTML, and validate external URLs before making clickable links.

## Exact data contract

The return value of `getProjects()` is `NormalizedPublicProject[]`; the endpoint wraps the same array in `projects`. `PublicProject` keeps the three additive fields optional for existing hand-authored consumers, while fetched projects always contain them. Only these fields are returned:

| Field | Meaning |
| --- | --- |
| `id` | Decimal string from Postgres bigint via `id::text`; do not convert to Number. |
| `title`, `description`, `weblink` | Original project values, each string or null. |
| `originalLanguage` | `es`, `en` or `ca` when settings exist; null means unknown. |
| `translations` | Array of objects with **only** `language`, `title`, `description`; content fields may be null. |
| `images` | Ordered array containing only `{ url: string }`; no raw image metadata. |
| `category`, `year` | String or null, preserved without trimming or coercion; year is not a number. |

Image URLs must use the configured Supabase origin and the public `projects-images` or `user-media` bucket. Signed URLs, foreign origins, query strings, fragments, traversal and control characters are rejected, including nested encoded traversal. Valid encoded object names (spaces, Unicode, literal percent, hash and question mark) remain unchanged. Missing legacy fields normalize to `images: []`, `category: null`, `year: null`; present invalid fields fail the whole response rather than dropping one project. Present null images are invalid.

Keywords, raw `image_data`, map coordinates, prompts, NAS folders, owner UUID and internal automation/assignment metadata are not public output. This local consumer integration follows reference commit `9ea92f0`; it does not repeat shared-service migrations or deployment. The [ES/CA presentation](e-estudio-portfolio.md#esca-presentation) renders these fields separately from the data consumer.

- All projects belonging to the configured UUID are included, regardless of state. There is no draft/published filter. The site never accepts visitor owner overrides; the shared public Edge service accepts any valid owner selector.
- The external service owns the nested `projects -> project_translation_settings -> project_translations` relation and database queries. This website consumes its validated DTO, never reconstructs a database join.
- Missing settings remain `originalLanguage: null` and `translations: []`; Spanish is not inferred. Settings without translations preserve the known original language and an empty array.
- Partial translations remain partial: a null title or description stays null. No locale fallback, translation synthesis or automatic locale enabling occurs. Database content languages (`es`, `en`, `ca`) are independent of the site's enabled-page locale registry; the existing [i18n contract](i18n.md) still governs routes and UI.

Each `getProjects()` call reads exactly `MOCKLAB_PROJECTS_URL` and `MOCKLAB_USER_ID` at runtime and delegates to the [public client](projects-client.md): one credential-free GET with `uid`, no-store, rejected redirects and a ten-second deadline. The client validates the complete `{projects: [...]}` response, including strictly increasing signed-bigint string IDs, and reconstructs the allowlist. Ownership selection and database pagination belong to Edge; the owner-free DTO cannot independently prove ownership at the site. Errors expose no upstream details. There is no cross-request data cache, ISR or persistent caching. Edge pagination is not a transactional snapshot across simultaneous database edits; failures never return a knowingly partial portfolio.

Dashboard content changes appear on subsequent requests to the dynamic endpoint or an on-demand page without rebuilding. Already open browser components must fetch again to observe changes; no realtime subscription or polling is installed. Configuration/code changes still follow the normal deployment lifecycle.

## Category labels and options

Use `src/lib/project-categories.ts` for presentation. `src/data/project-categories.ts` owns the ordered stable IDs, derived `ProjectCategoryId` type and separate Spanish/Catalan/English dictionaries typed against the site's `Locale` registry. A supplied dictionary must cover every category; a newly registered locale may have no dictionary. Translation availability does not enable a site language.

```ts
import { getProjectCategoryLabel, getProjectCategoryOptions } from '@/lib/project-categories';

getProjectCategoryLabel('publico', 'es'); // 'Espacio público'
getProjectCategoryLabel('publico', 'en'); // 'Public space'
getProjectCategoryLabel('unknown', 'es'); // null
getProjectCategoryLabel('publico', 'fr'); // null, never Spanish fallback
const options = getProjectCategoryOptions('en'); // fresh { value, label }[] or null
```

Pass the actual page locale. The existing Home card, portfolio card and detail use `Astro.currentLocale ?? defaultLocale` for the unprefixed Spanish route; an explicit unsupported locale is not replaced. Category lookup is independent of the client's ES/CA title/description selection.

- IDs remain exactly `residencial`, `docente`, `oficinas`, `planeamiento`, `industrial`, `cultural`, `publico`, `rehabilitacion`, `interiorismo`, `sanitario`, in that order. No trimming, case conversion or label-to-ID conversion occurs.
- Missing/unknown categories and missing/untranslated locales return `null`; options also return `null` without a locale dictionary. Consumers omit missing labels, retaining the year when supplied and omitting empty metadata containers.
- Save/filter by `value`, never by translated `label`. Returned option arrays and objects are fresh. No category filter or selector currently exists, so this change introduces no new UI.
- The API's nullable string category remains untouched, including arbitrary unknown strings. This catalog is not an API validator, migration or change to stored data.

Run `node --test tests/project-categories.test.mjs tests/portfolio-pages.test.mjs tests/home-runtime.test.mjs` for dictionary, null handling, option isolation, localized HTML and unchanged API checks, then the full validation below. HTML checks do not establish browser appearance.

## Build, local checks and deployment boundary

The official `@astrojs/vercel` adapter supports Astro 7. Before an authorized deployment, select Node.js 24.x in Vercel Project Settings (the package's `engines.node: 24.x` selects this major), set `ENABLE_EXPERIMENTAL_COREPACK=1` to honor the exact `packageManager` version, and use `corepack pnpm install --frozen-lockfile` and `corepack pnpm build` for install/build commands. These are required platform settings to check, not changes made remotely or proof of a live deployment. Static output is in `dist/client/` and copied to `.vercel/output/static`; Vercel functions and routing metadata live under `.vercel/output/`. Uploading static assets alone cannot serve the dynamic endpoint. Do not commit generated `.vercel/` artifacts or treat old output as a fresh verified release.

`corepack pnpm preview` is **not supported** by this adapter and exits with an explanatory error. Use `corepack pnpm dev` for local interactive work. The automated runtime test wraps the built Vercel handler in local HTTP with fake upstream responses; it is not a Vercel deployment emulator or proof of live platform behavior.

`corepack pnpm run validate` checks types, builds without real configuration, and runs identity/styling, multilingual, data/security, dependency-compatibility and public-HTTP tests. Fixtures never call live Supabase. Site coverage includes fixed-owner configuration, credential-free public GET, all-state pass-through, absent/partial translations, sanitized failures, no-store, runtime changes without rebuilding and client-import rejection. SQL/Edge-exclusive tests were removed with the externally maintained backend. Service-side owner selection, nested relations and capped pagination remain that service's verification responsibility; retained consumer tests are not a substitute. Neither a passing build nor these tests prove live Supabase grants, Vercel configuration or visual approval.

### Dependency security limitation

A narrow pnpm override in `pnpm-workspace.yaml` (`'@vercel/routing-utils>path-to-regexp': '6.3.0'`) pins `@vercel/routing-utils`'s `path-to-regexp` dependency to **6.3.0**, addressing the reported backtracking advisory without a major API change. A focused test compares expressions, keys and options to routing-utils' own patched 6.3.0 alias, including adjacent parameters; the adapter build/runtime tests protect integration compatibility.

The remaining Zod advisory is **unresolved**: the available `@vercel/cli-config` 0.3.5 pins Zod 4.1.11 and its distributed runtime also bundles that version. Merely overriding the declared dependency to patched Zod would not replace the bundled implementation. The historical npm-based integration audit (before the pnpm migration), `npm audit --json`, exited 1 with **five high findings**, all from that Zod dependency chain; the routing advisory is gone.

Independent isolated verification found no reachable path from this public endpoint to the vulnerable bundled parser: the generated function excludes `@vercel/functions`, `@vercel/oidc` and `@vercel/cli-config`, while its separate Astro Zod is 4.6.7. The inspected CLI-config parsers consume local configuration/authentication JSON, and their application schemas do not define constrained collection validators. This is evidence about this generated candidate, not a clean dependency tree or a guarantee for future adapter features. The trusted-tooling advisory remains unresolved.

The installed adapter is 11.0.17. The initial audit's suggested adapter 8.0.4 requires Astro 5, not Astro 7. After the routing correction, audit instead suggests adapter 11.0.8: it supports Astro 7, but its declared `@vercel/functions: ^3.4.3` range still permits the currently vulnerable chain, so downgrading the adapter alone is not a demonstrated fix. No downgrade or Zod override was applied. Do not use forced audit fixes or claim the dependency tree is clean. A compatible upstream correction replacing the vulnerable bundled implementation, or another separately evaluated and tested resolution, remains necessary; deployment approval must explicitly account for this unresolved dependency risk.

## Consumer change checklist

Use the [client change/release checklist](project-kickoff.md) and [working brief](project-brief.md); reopen only decisions affected by the change:

- [ ] The exact public portfolio owner UUID and approved public content, including every state.
- [ ] Approved allowlisted fields and partial-content behavior; preserve complete-translation-or-whole-original ES/CA presentation without field mixing.
- [ ] Server-rendered versus browser-fetched composition, refresh behavior and failure presentation.
- [ ] Public URL/owner configuration ownership, shared-service rollout gates and acknowledgement of the unresolved dependency risk.

Client design, additional data fields, authentication, database changes and deployment remain separate approvals. Return to the [README](../README.md) for client setup and maintenance.

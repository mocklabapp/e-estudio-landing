# e estudio — client website

Independent **e estudio** architecture website, built with Astro, strict TypeScript and Tailwind CSS 4. The intended repository is [mocklabapp/e-estudio-landing](https://github.com/mocklabapp/e-estudio-landing.git); this records the destination, not publication or deployment approval. The project originated from base-landing-mocklab but is no longer a reusable starter or client generator.

Resume from [the handoff](docs/e-estudio-handoff.md), [the client brief](docs/project-brief.md) and [the client change/release checklist](docs/project-kickoff.md). Preserve the approved design and existing client work. Supplied branding and editorial images are applied; system fonts remain provisional. Contact is a no-send/no-storage demonstration. Participation, signup and voting remain excluded.

## Current site

- Spanish `/` and Catalan `/ca/` have equivalent-page navigation; project detail switches retain the ID. English remains disabled. See [localization](docs/e-estudio-localization.md).
- Both homes and portfolios render live public Mocklab projects server-side with no-store headers. Other editorial routes remain static.
- Project cards show the first image, title, recognized category and year. Details preserve complete descriptions and ordered image galleries. ES/CA uses a complete selected translation or the whole original, never mixed fields. See [the portfolio guide](docs/e-estudio-portfolio.md).
- Supplied brand, Home, Studio/team/collaborator, Services, Research and Contact assets are in `public/`. Their presence is not browser fidelity or licensing sign-off.
- No production domain is configured. Canonical/hreflang head links require the real Astro `site`; no sitemap, robots policy, social cards or structured data are configured.

## Quick start

Use Node.js **24.x** (`nvm use`), an available **Corepack** executable and pinned **pnpm 12.16.1**. Corepack is not supplied by this project or guaranteed by every Node installation. Keep `pnpm-lock.yaml` and `pnpm-workspace.yaml`; this is a single package, not a monorepo.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm run validate
corepack pnpm dev
```

Install explicitly on a fresh copy before package-manager probes. `node --version` should report 24.x and `corepack pnpm --version` should report `12.16.1`. No global pnpm installation or Corepack activation is required. Scripts resolve local binaries without invoking another package manager.

Open Astro's printed URL (normally http://localhost:4321). Checks, builds and fixture-backed tests need no real credentials. Live Home/portfolio requests require human-managed `MOCKLAB_PROJECTS_URL` and `MOCKLAB_USER_ID`; without valid configuration they show a sanitized unavailable state. Follow [the consumer setup](docs/projects.md#configure-one-portfolio). Never inspect, commit or expose local environment values; no database/API key belongs in this website.

## Commands

| Command | Purpose |
| --- | --- |
| `corepack pnpm dev` | Start the development server. |
| `corepack pnpm check` | Check Astro and TypeScript types. |
| `corepack pnpm run check:tooling` | Strict no-output checking of retained multilingual/build fixtures and package/toolchain tests, including imported helpers. |
| `corepack pnpm build` | Build static pages in `dist/client/` and Vercel functions/routing in `.vercel/output/`. |
| `corepack pnpm preview` | Unsupported by the Vercel adapter; use the development server. |
| `corepack pnpm test` | Build and run the complete Node test suite. |
| `corepack pnpm run validate` | Check types, build and run all output/i18n/client/security/runtime tests. |
| `corepack pnpm astro --help` | Show Astro CLI help. |

Run `check:tooling` separately for tooling changes; `validate` retains its existing pipeline. Guides using `pnpm` shorthand mean the same pinned version via `corepack pnpm` (or an existing pnpm reporting exactly 12.16.1).

## Structure

| Location | Responsibility |
| --- | --- |
| `src/pages/` | Static editorial and on-demand Home/portfolio/API route composition. |
| `src/layouts/BaseLayout.astro` | Document shell and shared metadata. |
| `src/components/shared/` | Site header/footer and shared page renderer. |
| `src/components/ui/`, `sections/` | Small presentation primitives and complete sections. |
| `src/components/home/`, `editorial/`, `contact/`, `projects/` | Client feature presentation. |
| `src/config/site.ts` | Shared identity. |
| `src/data/`, `src/data/localized/` | Typed content, Catalan copy and category catalog. |
| `src/i18n/` | Locale registry, UI and publication rules. |
| `src/lib/` | Non-visual domain utilities and server-only public-project consumer. |
| `src/styles/` | Tailwind entry and semantic theme tokens. |
| `public/` | Unchanged supplied assets, including branded favicons. |
| `tests/` | Generated HTML, isolated builds and fixture-backed consumer/runtime checks. |
| `odd/tasks/` | Historical decisions and implementation/verification evidence. |

## Maintain this client

1. Read [AGENTS.md](AGENTS.md), the handoff and the brief. Do not restart a new-client interview or regenerate this repository.
2. Confirm the requested routes, acceptance criteria and any changed approvals. Reuse approved ES/CA content, palette and assets; ask only about consequential gaps.
3. Keep native Astro components cohesive, TypeScript strict and hand-authored code files at 300 physical lines maximum. Do not add dependencies or services without a concrete approved requirement.
4. Follow [the change/release checklist](docs/project-kickoff.md). Run focused behavior tests first, then validation and applicable tooling checks. Visual/interaction changes also require browser review.
5. Keep implementation, repository publication, deployment and personal-data collection permissions separate. The intended GitHub destination grants none of the latter permissions.

## Live public projects

`getProjects()` in `src/lib/projects.ts` is server-only. `/api/projects.json` is the dynamic browser-consumption boundary. Each request reads the fixed public endpoint and owner UUID, makes a credential-free GET, validates unknown JSON and returns only the public allowlist. UID selects public output, **not authorization**; all project states are intentionally public.

The DTO contains `id`, nullable `title`, `description`, `weblink`, `originalLanguage`, `translations` with only `language/title/description`, ordered `images` with only `url`, and nullable string `category/year`. Image URLs must use the configured Supabase origin's approved public buckets. Missing legacy additions normalize to `[]`, `null`, `null`; invalid present fields fail closed. No private metadata or keywords are exposed.

Every live route sets Cache-Control, CDN-Cache-Control and Vercel-CDN-Cache-Control to no-store on success and failure. There is no ISR, persistent data cache or open-tab polling. The shared backend, SQL, deployment and their exclusive tests are maintained outside this client repository; this site retains its consumer validation, owner-selection, failure and security tests. See [the integration contract](docs/projects.md) and [client request/response guarantees](docs/projects-client.md).

The **bundled-Zod dependency advisory remains unresolved**. Preserve the narrow routing-utils/path-to-regexp override and its compatibility test. Local fixtures are not live Supabase/Vercel permission or gateway proof; deployment requires separate operator verification and explicit risk acceptance.

## Styling contract

**Tailwind CSS 4 + semantic tokens + native Astro components** remain the foundation. The approved anthracite/stone/sand/bone palette is recorded in the brief and implemented in `src/styles/tokens.css`; do not replace it with starter defaults.

- Keep raw colors and font stacks in the token file. Use semantic utilities such as `bg-canvas`, `text-ink`, `text-muted`, `border-line` and `bg-brand`.
- Tailwind Preflight owns the reset. Reuse spacing/type scales and complete static utility names; keep genuinely custom CSS scoped to its component.
- Existing Bodoni/Didot/Times serif and Helvetica/Arial sans stacks are provisional. Cormorant Garamond/Montserrat remains a proposal, not installed or licensed by this repository.
- Obtain approval and usage rights before font changes. Preserve supplied artwork; check responsive appearance, contrast, focus, glyphs and real font/image loading in a browser.

No client-side framework, Supabase SDK or analytics is installed. The no-send contact simulation does not authorize a form provider or live collection. See [Contact](docs/e-estudio-contact.md), [editorial pages](docs/e-estudio-editorial.md) and [language maintenance](docs/i18n.md).

[Astro documentation](https://docs.astro.build/)

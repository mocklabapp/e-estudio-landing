# Change and release the e estudio website

Maintain this existing client website; do not start another client interview or regenerate a starter. [The brief](project-brief.md) records approved design/content and historical decisions. [The handoff](e-estudio-handoff.md) summarizes implementation and verification limits. This checklist replaces the original generic kickoff protocol, not the client's decisions.

## Quick path

1. Read [AGENTS.md](../AGENTS.md), the brief, handoff and relevant feature task. Inspect existing changes before editing; do not overwrite unrelated tracked or untracked work.
2. Confirm the requested outcome, affected routes/locales and observable acceptance criteria. Reuse supplied answers and approved assets.
3. Resolve only consequential unknowns. Ask 1–3 focused questions in the human's language, wait, then record confirmed/proposed/pending decisions in the brief.
4. Apply the [approval gate](#approval-gate) for the named slice. Safe unrelated maintenance need not wait for fonts, launch details or other deferred decisions.
5. Implement the smallest cohesive change, run applicable checks and record their actual results and limitations.

## Existing decisions to preserve

| Area | Current contract |
| --- | --- |
| Identity and destination | e estudio residential architecture; intended GitHub repository `https://github.com/mocklabapp/e-estudio-landing.git`, not evidence of publication. |
| Design | Supplied reference compositions and approved palette; native Astro, strict TypeScript, Tailwind 4 and semantic tokens. |
| Languages | Spanish `/` and Catalan `/ca/`, equivalent-page links retaining detail IDs; English disabled. |
| Assets and typography | Supplied branding/editorial images applied. Current serif/sans system stacks provisional; proposed custom fonts require confirmation and rights. |
| Projects | Existing Mocklab public service, fixed configured owner, validated rich DTO and no-store SSR; no second CMS or direct database access. |
| Project text | Complete selected translation or whole original; no mixed fields or inferred original language. |
| Contact | Approved public contact details and illustrated location plan; no third-party map embed and no sending/storage. |
| Exclusions | Participation, signup and voting; no invented destinations, testimonials, claims or project records. |
| Release | Production domain/indexing/hosting and launch authorization remain separate unresolved gates. |

See [localization](e-estudio-localization.md), [portfolio](e-estudio-portfolio.md), [Contact](e-estudio-contact.md) and [the consumer contract](projects.md) before changing those areas. Shared service implementation, grants, SQL and deployment are maintained outside this repository.

## Scope a client change

- Identify changed requirements and reopen only affected decisions. Preserve unrelated approvals and historical evidence; do not replace the brief with a blank template.
- Record supplied facts separately from proposals. Pending and not-applicable are valid states with explicit consequences; they do not silently authorize dependent work.
- Track public copy, image/font rights and approval owners. Never invent endorsements, statistics or licensing claims. Supplied raster crops may still need higher-resolution originals and browser review.
- For additional languages, agree page coverage and translated UI/body/metadata before enabling them. Keep current ES/CA intact. Page publication has no fallback; project text follows its separately approved policy.
- For data changes, confirm the public allowlist and all-state visibility with the service owner. Never add private fields, credentials, owner overrides or a second database.
- For new interactions, first agree the visitor need, provider, success/error behavior, data minimization, storage/retention and privacy-review owner. A working demo does not authorize real data collection, payments, accounts or third-party embeds.
- Never request passwords, private keys or real submissions in the brief. Human-managed runtime configuration stays outside source and documentation. A technical checklist is not legal approval.

## Approval gate

Before implementing a consequential change, summarize:

1. **Confirmed scope:** deliverable, routes/locales, approved copy/assets and existing behavior to preserve.
2. **Proposals:** decisions still needing explicit agreement, separate from confirmed facts.
3. **Deferrals:** blocked dependent work and safe work that can proceed.
4. **Checks and permissions:** focused tests, full validation, browser needs and any publication/deployment/data permissions **not** granted.

Wait for missing approvals. Readiness applies only to the named slice, never automatically to release. Update the brief's next unresolved item and decision record after each answered block.

## Implementation and verification checklist

- [ ] Preserve shared layout/metadata, semantic tokens, domain ownership and native Astro composition.
- [ ] Keep strict types, validate external input as unknown, and review hand-authored code files against the 300-physical-line maximum.
- [ ] For deterministic behavior changes, observe meaningful RED before GREEN; use structural checks for passive docs without inventing RED.
- [ ] Use Node 24.x and pnpm 12.16.1. Run focused tests, `corepack pnpm run validate`, and `corepack pnpm run check:tooling` for tooling changes. Do not weaken unrelated failing tests.
- [ ] Check changed documentation links/anchors and consistency with actual source.
- [ ] For visual/interaction work, inspect affected ES/CA pages in a browser: desktop/mobile, keyboard/focus, contrast, zoom and font/image loading.
- [ ] Record exact failures, skips and unavailable checks. Fixture-backed builds do not prove live platform behavior or browser fidelity.

## Release checklist — separate authorization required

- [ ] Obtain explicit repository publication and deployment permissions; the named GitHub destination alone grants neither. Do not rewrite history or change remotes as routine maintenance.
- [ ] Confirm the real production origin and configure Astro `site`; inspect actual route canonicals and reciprocal ES/CA hreflang, including detail IDs.
- [ ] Resolve production/preview indexing and migration redirects. Crawl blocking alone is not reliable noindex or access control. No sitemap/robots/social-card/structured-data feature is assumed implemented.
- [ ] Confirm hosting/runtime configuration ownership and the external public service's target, grants, gateway and rollout evidence. Do not retrieve credentials or deploy just to test them.
- [ ] Acknowledge the [unresolved bundled-Zod advisory](projects.md#dependency-security-limitation); retain the scoped routing compatibility override and tests.
- [ ] Obtain final content/asset, privacy/legal and browser approvals. Confirm delivery and maintenance ownership.
- [ ] Keep the form non-sending until a separately approved collection integration is implemented and verified.

Record authorization, restrictions and observed release evidence in the brief. Implementation completion, source translation approval and a green local suite are not permission to publish.

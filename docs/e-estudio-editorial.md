# Maintain the e estudio editorial pages

Native Astro components implement the approved ES/CA client compositions. Routes own live data and response status; `PageRenderer.astro` composes content with the shared shell and metadata. Keep the approved design, applied artwork and provisional fonts; this guide is not a redesign or launch authorization.

## Entry points

| Routes | Component | Props |
| --- | --- | --- |
| `/`, `/ca/` | [`HomePage.astro`](../src/components/editorial/HomePage.astro) | `title: string`, `description: string`, optional `projects: readonly PublicProject[]`, `unavailable: boolean` |
| `/estudio/`, `/ca/estudi/` | [`StudioPage.astro`](../src/components/editorial/StudioPage.astro) | None |
| `/servicios/`, `/ca/serveis/` | [`ServicesPage.astro`](../src/components/editorial/ServicesPage.astro) | None |
| `/living-research/`, `/ca/living-research/` | [`ResearchPage.astro`](../src/components/editorial/ResearchPage.astro) | None |

Keep Home's title/description connected to the page/configuration contract. Its unadorned `<h1>` and `<p>` remain intentional; wrappers own styling. Content components do not duplicate the header, footer or main landmark. Locale-aware copy lives under `src/data/localized/`; internal links use the selected locale. See [localization](e-estudio-localization.md).

## Content and asset boundaries

- **Home:** centered title/subtitle and studio link, two unchanged editorial crops in `public/home/`, latest-three real projects, then the sand conversation band. Native `home/` components receive public data, not configuration or a database client. Route owners select the highest numeric IDs without precision loss, preserve API ordering, and provide empty/unavailable states. No fabricated featured projects or screenshot project crops.
- **Studio:** founders/room photographs, actual supplied portraits and collaborator artwork in `public/studio/`. `StudioTeam.astro` owns portraits/name/role; `studio/StudioCollaborators.astro` owns collaborator logos and `studio/assets.ts` maps assets. Typed names/roles remain in `src/data/editorial.ts`. Final copy precedes room media; the closing contact link is not an invented destination.
- **Services:** `public/services/habitar.png` and `promover.png` precede the offers. Supplied e living artwork follows the divider. No expanded service content or empty “Saber más” anchors; CTAs use the localized contact path until another destination is approved.
- **Research:** eleven clean supplied crops in `public/living-research/`, split hero, four models, three exact questions, meeting banner, five-step method, community row and page-local sunset contact band. `research/` components own cohesive subsections. No signup, participation, voting, dates, forms or client scripts are introduced.
- **Brand/fonts:** supplied `public/brand/` PNG logos/favicon artwork is applied, not mocked. Bodoni/Didot/Times and Helvetica/Arial system stacks remain provisional. No custom fonts, external providers or dependencies were added.

Image presence is not final visual approval. Supplied raster crops have resolution limits; original high-resolution images/vector artwork may still be preferable. Use honest placeholders only for genuinely missing data/media, not as a description of already-applied images. [Home asset notes](../public/home/README.md) and [Research asset notes](../public/living-research/README.md) preserve provenance.

## Focused checks

```sh
node --test tests/editorial-pages.test.mjs
node --test tests/home-projects.test.mjs tests/home-runtime.test.mjs tests/home-renderer.test.mjs
node --test tests/services-images.test.mjs tests/brand-assets.test.mjs
corepack pnpm check
corepack pnpm run validate
```

The retained fixture-backed tests cover source content, delivered assets, route/metadata boundaries, bigint selection, live refresh/no-store, honest failures and excluded controls. Generic registry siblings remain static without accessing projects. Generated HTML and asset dimensions do not establish responsive appearance or screenshot fidelity.

## Historical implementation evidence

The initial editorial implementation observed five intended failures followed by seven passing tests. A bounded screenshot-correction batch observed four intended failures followed by ten passing tests; no additional fix round was needed. Visual-only alignment/spacing/font changes had no deterministic RED claim. Type checking passed with no errors or warnings and two existing numeric-literal hints. Full validation was parent-owned for that original unit; its template-presence failure was recorded, not weakened.

Those counts describe earlier provisional components, not the current integrated suite. Subsequent [Research and Home evidence](project-brief.md#living-research-verification), [ES/CA evidence](e-estudio-localization.md#metadata-and-verification) and [cleanup tracking](../odd/tasks/e-estudio-repository-cleanup.md) preserve later results and limits. Report new verification separately instead of presenting old failures as current facts.

## Remaining review

Inspect actual ES/CA routes and metadata, desktop/mobile layouts, keyboard focus, zoom, contrast and font/image loading in a real browser. No browser or screenshot-fidelity sign-off is claimed here. Custom typography and production release remain separately gated.

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
- **Research (client brief S9–S14 and mockup alignment S20, Nov 2026):** eight of the supplied clean crops in `public/living-research/` (the three former LR question photos remain in `public/` but are unused), composed by `research/` components in this order: `ResearchHero` (text left, photo filling the right of the band and fading into the page via a CSS mask; eyebrow with `title-rule`, h1 and intro, no button and no closing phrase), `ResearchModels` (four model cards: image, name, short rule and a native `<details>` explanation, no client JS), `ResearchMethod` (meeting banner, «EL MÉTODO» block with intro and the five numbered steps with descriptions in a 3 + 2 grid with arrows, then the «LA COMUNIDAD» block with «Quiero formar parte →» to `#research-participate`), `ResearchParticipate` and `ResearchClosing` (panoramic sunset band: «LIVING RESEARCH» eyebrow, closing phrase, «¿Cómo te gustaría vivir? →» and outlined «CONTACTO →», both to the Contact page; the common footer follows as a separate element). `ResearchLink.astro` is the small underlined arrow link shared by these blocks. The «Investiguemos juntos» section (LR01–LR03) was removed on 17 November 2026 because surveys and statistics are outside the budget. Model definitions and steps live in `src/data/editorial.ts`; complete ES/CA copy lives in `src/data/localized/research.ts`.
  - **Pending from the client:** the model explanations in `housingModelDefinitions` are neutral general drafts awaiting validation. «Este año queremos conversar sobre…» stays omitted, the mockup's «Conoce el proyecto» button and «Explorar modelos residenciales →» link have no approved target and are not rendered.
  - **Participate form:** «Cuéntanos qué te interesa» (name, email, message) is a no-send/no-storage demo following the Contact pattern, with the mockup's intro and placeholders («Nombre» / «Email» / «Tu mensaje…»; labels remain for assistive technology): a `role="form"` group (no native `<form>`/`action`), a button labelled «Simular envío» and disabled until JS, a visible demo notice and a status region. Validation and enhancement are shared by Contact and Research through `src/lib/form-preview/` (`validation.ts`, `enhance.ts`) with `contact-preview.ts` and `interest-form.ts` as thin typed adapters. Real delivery still needs an approved provider, recipient, antispam and privacy/consent text. The voting block, checkboxes, signup and event dates remain excluded.
  - **Image limits:** the hero (343 × 328) and sunset (280 × 199) crops are small and are cropped/enlarged across their bands; the originals or higher-resolution files remain pending. Hero fade, grid proportions and arrows follow `docs/mockups/2026-11/living-research.jpg` but are not browser-verified.
- **Brand/fonts:** supplied `public/brand/` PNG logos/favicon artwork is applied, not mocked. Bodoni/Didot/Times and Helvetica/Arial system stacks remain provisional. No custom fonts, external providers or dependencies were added.

Image presence is not final visual approval. Supplied raster crops have resolution limits; original high-resolution images/vector artwork may still be preferable. Use honest placeholders only for genuinely missing data/media, not as a description of already-applied images. [Home asset notes](../public/home/README.md) and [Research asset notes](../public/living-research/README.md) preserve provenance.

## Focused checks

```sh
node --test tests/editorial-pages.test.mjs
node --test tests/research-page.test.mjs   # needs a prior `corepack pnpm build`
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

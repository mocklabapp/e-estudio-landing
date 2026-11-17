# November 2026 client adjustment brief — status

e estudio sent an adjustment brief on 13 November 2026. The task record is [odd/tasks/client-brief-nov-2026.md](../odd/tasks/client-brief-nov-2026.md). This page separates what has been applied from what still needs client or human input. Applying a change here is not launch approval.

## Applied in the preview

- **Palette:** secondary text uses #555555. White stays the main background, and the footer is now a white band with a fine top rule, so the last section is never followed by a second coloured band. Text accents keep the darker `brand` token for contrast; see the open decision below.
- **Typography and spacing:** headline sizes and section padding are a little smaller, and there is less space between the header and the first title. The active navigation item has a discreet stone underline. No italics are used.
- **Footer:** shows the address, phone, email and Instagram from one source, `src/config/contact.ts`. The preview notices stay until launch.
- **Studio:** fine dividers between sections, and an arrow on the Contact access link.
- **Projects:** listing cards use a 4:3 image ratio instead of 3:2, in the existing three-column grid.
- **Contact:** lighter headings and tighter spacing between the form and location blocks.
- **Living Research:** see [editorial pages](e-estudio-editorial.md). The changes are:
  - the hero has no button;
  - each model has an explanation (draft text);
  - the community call to action;
  - a «Cuéntanos qué te interesa» form that is a demo and sends nothing;
  - the sunset closing band.

## Mockup alignment (2026-11-17)

The client mockups were received and kept locally in `docs/mockups/2026-11/`. That folder is excluded from Git through `.git/info/exclude`; whether to commit client design files is a human decision.

Applied from the mockups:
- **Shared:** short rules under eyebrows and titles (`title-rule`).
- **Home:**
  - centred hero;
  - two cards separated by a vertical line;
  - featured projects with a «Ver todos los proyectos» link;
  - closing band with only «conversación.» in the accent colour.
- **Studio:** «Equipo».
- **Projects list:** ruled title and the «Cada proyecto, una forma de habitar.» band.
- **Services:**
  - the habitar/promover layout and list;
  - the e living block;
  - a band with only «Vivir» in the accent colour.
- **Living Research:**
  - the hero photo fades in on the right;
  - LR texts and approximate meeting dates;
  - method step descriptions in a 3 + 2 grid;
  - community text;
  - form intro;
  - closing eyebrow and links.
- **Contact:**
  - serif headings;
  - form intro, «*» and placeholders;
  - icon list and «Horario» column;
  - a vertical line between form and location.
- **Footer:** logo, nav, email/phone/city and an Instagram icon.
- **Header:** three-line mobile menu icon.

Kept deliberately, because the brief or the facts require it:
- the voting block is removed;
- «Este año queremos conversar sobre…» and «Conoce el proyecto» are omitted;
- demo forms keep honest «Simular envío» labels;
- links without an approved destination point to Contact (`Saber más`, e living) or are omitted («Explorar modelos residenciales», LinkedIn, legal links, privacy line);
- project cards show year and category until location and intervention fields exist;
- the project detail page is unchanged until its data exists.

## Waiting on client or human input

| Item | Needed |
| --- | --- |
| Logos | Final vector files for e estudio (monogram plus «e estudio / ARQUITECTURA RESIDENCIAL») and e living. |
| Fonts | Confirm the families and supply the font files and licences. |
| Mockups | Received and applied. The «Investiguemos juntos» section was later removed because surveys and statistics are outside the budget (2026-11-17). |
| Destinations | URLs for «Saber más» (habitar, promover), «Explorar modelos residenciales» and LinkedIn. |
| Accent contrast | #A89F92 on white is about 2.6:1, which is too low for text. Confirm whether ocre text may use the darker accessible tone. |
| Project data | Location, type of intervention, area, status and the four-moment narrative (Persona/Deseo, Proyecto, Obra, Vida) are not in the Mocklab public data. They need new fields in the external service, plus real project selection and permissions. |
| e living | A real destination or an approved provisional page. Until then the Services link goes to Contact. |
| Living Research | Validate the model explanation drafts, and supply higher-resolution hero and sunset images. |
| Real forms | Recipient address, sending provider, antispam, consent and privacy text for Contact and Living Research. Both forms stay demos until then. |
| Legal and cookies | Legal notice, privacy and cookie texts, plus the footer legal links that depend on them. |
| Contact data | e estudio to re-verify address, phone, email, Instagram and hours. |
| Studio | Final list of team, clients and collaborators, and permission to use their logos. |
| Photography | Real Casa Bot facade, studio, modernist details, team portraits and work images. |
| Launch | Domain, hosting, email, SEO (`site`, sitemap, robots), removing the preview notices, and a desktop/mobile browser review. |
| Questions to Mocklab | Domains and hosting costs, linking e living, a provisional page, a content manager, and what e estudio can edit itself. |

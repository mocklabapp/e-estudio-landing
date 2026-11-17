# Try the contact demonstration

The `/contacto/` and `/ca/contacte/` previews have a localized client-side simulation, not a working contact service. Use test values only. No request is sent and nothing is persisted.

## Behavior

1. Complete name, email or phone, subject and message (all marked with «*»; the placeholders are «Tu nombre», «Tu email o teléfono», «Selecciona una opción» and «Cuéntanos…»).
2. Choose **Simular envío**. Required/invalid fields receive feedback and focus.
3. A valid simulation explicitly confirms that no message was sent or saved.

Without JavaScript, the simulation button stays disabled. The accessible `role="form"` group is deliberately not a native submitting form, so pressing Enter cannot serialize values into a URL or submit them. The status area uses polite announcements and never echoes entered text as HTML.

## Components and checks

- `src/components/contact/ContactPage.astro`: composition, serif h1 with the accent «Casa Bot.», approved facade/interior images from `public/contact/` and the fine vertical line between form and location on desktop.
- `src/components/contact/ContactLocation.astro`: approved public address, contact links and a separate «Horario» column, each with a line icon.
- `src/components/contact/ContactIcon.astro`: decorative inline `aria-hidden` SVG line icons (pin, phone, mail, Instagram, clock); the footer reuses the Instagram one.
- `src/components/contact/ContactMap.astro`: native illustrated location plan and outbound directions link.
- `src/components/contact/ContactForm.astro`: labelled controls, demonstration notice and safe enhancement.
- `src/lib/contact-preview.ts`: typed validation and local feedback.
- `node --test tests/contact-preview.test.mjs`: rendered content, validation and side-effect guards.

The component tests are not a real-browser check. Browser appearance, native validity messages, keyboard behavior and the bundled script still need interactive review.

## Mockup alignment (November 2026, S21)

`docs/mockups/2026-11/contact.png` is applied: serif headings («Hablemos.», «Justo encima de El Melindró.») with eyebrows carrying the global `title-rule`, the form intro paragraph, required «*» labels and placeholders, and the location icons. ES/CA copy is complete in `src/data/localized/contact.ts`. Validation in `src/lib/contact-preview.ts` and the honest demo notice plus «Simular envío» button label are unchanged.

The shared footer (`SiteFooter.astro`) now shows logo + ©, the navigation, email, phone, «Cardedeu, Barcelona» (no street) and an Instagram icon link with an accessible name, from `src/config/contact.ts`. The mobile header menu is a fine three-line icon with a visually hidden «Menú» label.

Pending real URLs/pages, deliberately not rendered: LinkedIn, the legal links (Aviso legal | Privacidad | Cookies) and the mockup's «Al enviar este formulario aceptas nuestra política de privacidad» line. The footer keeps the preview notices, to be removed at launch.

## Applied public contact material

The facade/interior photographs and location at Plaça de l’Església, 23, Cardedeu are applied. The brief records definitive public phone, email, Instagram and hours; `ContactLocation.astro` renders those approved links in both languages. They do not authorize a production form recipient.

The approved illustrated plan replaces the earlier map-embed proposal. It uses inline SVG and an outbound Google Maps directions link, not a third-party embed, API key or background request. It is orientative, not a precision-cartography claim. The historical standalone “Plano orientativo” assertion failure remains recorded in the brief; fresh validation must establish its current result without weakening the test.

## Deliberately pending

Legal copy, any production collection provider/recipient and live submission require separate approval and privacy review. No fake privacy link, send endpoint or storage is introduced. Applied images and structural tests do not establish browser fidelity.

# Try the contact demonstration

The `/contacto/` and `/ca/contacte/` previews have a localized client-side simulation, not a working contact service. Use test values only. No request is sent and nothing is persisted.

## Behavior

1. Complete name, email or phone, subject and message.
2. Choose **Simular envío**. Required/invalid fields receive feedback and focus.
3. A valid simulation explicitly confirms that no message was sent or saved.

Without JavaScript, the simulation button stays disabled. The accessible `role="form"` group is deliberately not a native submitting form, so pressing Enter cannot serialize values into a URL or submit them. The status area uses polite announcements and never echoes entered text as HTML.

## Components and checks

- `src/components/contact/ContactPage.astro`: composition and approved facade/interior images from `public/contact/`.
- `src/components/contact/ContactLocation.astro`: approved public address, contact links and hours.
- `src/components/contact/ContactMap.astro`: native illustrated location plan and outbound directions link.
- `src/components/contact/ContactForm.astro`: labelled controls, demonstration notice and safe enhancement.
- `src/lib/contact-preview.ts`: typed validation and local feedback.
- `node --test tests/contact-preview.test.mjs`: rendered content, validation and side-effect guards.

The component tests are not a real-browser check. Browser appearance, native validity messages, keyboard behavior and the bundled script still need interactive review.

## Applied public contact material

The facade/interior photographs and location at Plaça de l’Església, 23, Cardedeu are applied. The brief records definitive public phone, email, Instagram and hours; `ContactLocation.astro` renders those approved links in both languages. They do not authorize a production form recipient.

The approved illustrated plan replaces the earlier map-embed proposal. It uses inline SVG and an outbound Google Maps directions link, not a third-party embed, API key or background request. It is orientative, not a precision-cartography claim. The historical standalone “Plano orientativo” assertion failure remains recorded in the brief; fresh validation must establish its current result without weakening the test.

## Deliberately pending

Legal copy, any production collection provider/recipient and live submission require separate approval and privacy review. No fake privacy link, send endpoint or storage is introduced. Applied images and structural tests do not establish browser fidelity.

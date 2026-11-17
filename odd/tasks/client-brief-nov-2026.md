# Client brief adjustments — November 2026

Applies e estudio's 13 November 2026 adjustment brief to the existing preview. Only items executable without new human input are implemented here. Items needing assets, decisions, legal text, backend fields or publication are recorded as pending.
Branch: `feat/client-brief-adjustments`. Reference mockups were not supplied to this session; implementation follows the brief text and the existing approved compositions.

## Specs

- S1 Palette: "blanco puro #FFFFFF como fondo principal; antracita #1A1A1A para títulos, navegación y textos principales; gris oscuro #555555 para textos secundarios; piedra/ocre #A89F92 como acento discreto; arena #D9D3C8 y hueso #F6F4EF solo en bandas puntuales. Evitar el negro puro #000000."
- S2 Typography: "titulares ligeros y contemporáneos, alternancia contenida de sans fina y serif editorial; evitar que la serif domine, las cursivas decorativas y los tamaños excesivos." "Los destacados en ocre no van en cursiva." Composition: "Reducir separaciones verticales excesivas, especialmente entre cabecera y títulos."
- S3 Header: "logotipo, navegación Estudio / Proyectos / Servicios / Living Research / Contacto y selector ES / CA. Adaptar el menú a escritorio y móvil; señalar discretamente la página activa."
- S4 Bands: "Recuperar líneas finas de separación entre bloques donde figuren en la maqueta, especialmente en Estudio. En la franja final no colorear dos bandas consecutivas: mantener el contraste y ritmo de la propuesta."
- S5 Footer: "Pie corporativo común a todas las páginas: logotipo, navegación, datos de contacto reales, redes y enlaces legales. Al publicar, eliminar avisos y textos propios de la versión de pruebas."
- S6 Studio: "Mantener «Clientes y colaboradores» como denominación." "Añadir la pequeña flecha de navegación indicada en el acceso a Contacto, según maqueta."
- S7 Projects listing: "retícula editorial de tres columnas en escritorio, con imágenes de proporción menos apaisada, como la maqueta. Mostrar proyecto, ubicación/año y tipo de intervención, sin etiquetas unifamiliar/plurifamiliar."
- S8 Services: "Mantener provisionalmente «Vivir es una elección.» en la banda final"; "El enlace a e living deberá conducir a un destino real o a una página provisional acordada; no dejar enlaces rotos."
- S9 Research hero: "«LIVING RESEARCH / La forma de habitar está cambiando.», con fotografía a todo el ancho de la franja y texto introductorio."
- S10 Research discover: "«¿Conoces todas las formas en las que podemos vivir?» y cuatro modelos: Cohousing, Coliving, Comunidades intergeneracionales y Otras formas de habitar. Conservar el acceso a una explicación de cada modelo, ya sea mediante tarjeta, icono o enlace; no eliminar esa funcionalidad."
- S11 Research questions: "Investiguemos juntos (no «Preguntas abiertas»): LR01 «¿Cómo queremos vivir cuando seamos mayores?»; LR02 «¿Cómo vivirán nuestros hijos?»; LR03 «¿Qué posibilidades ofrecen los espacios que ya tenemos?»."
- S12 Research method/community: "«De la conversación a la realidad.» y cinco pasos: Preguntar, Conversar, Investigar, Explorar y Hacer posible." "Comunidad: «¿Quieres formar parte de Living Research?» con imagen de conversación colectiva y llamada a la acción".
- S13 Research participate: "ELIMINAR el bloque de votación «¿Qué temas te interesan más?» y sus ocho casillas y botón «Votar». MANTENER únicamente el formulario «Cuéntanos qué te interesa», con nombre, correo electrónico, mensaje y botón de envío. Composición limpia y abierta."
- S14 Research closing: "recuperar la fotografía panorámica de puesta de sol, con «Repensar la vivienda es también repensar cómo queremos vivir.», CTA «¿Cómo te gustaría vivir?» y botón Contacto. Esta frase corresponde al cierre, NO al hero. Debajo, colocar el pie corporativo común: son dos elementos distintos."
- S15 Contact: "Formulario: Nombre, Email o teléfono, ¿Sobre qué quieres hablar? y Mensaje." "Aligerar titulares y ajustar distancias entre formulario, fotografía y mapa."

## Tasks

- [x] T0 Explore the current implementation (explorer map) — S1-S15 — inline/explore — no commit
- [x] T1 Shell: S1 muted #555555, S2 lighter/less spacing, S3 active state, S4 footer band + Studio dividers, S5 footer contact/social from one source, S6 Studio arrow — inline — c97f386
- [x] T2 Project cards: S7 less landscape image ratio (4:3) — inline — c97f386
- [x] T3 Living Research: S9-S14 — writer — 0787909
- [x] T4 Contact headings/spacing: S15 — inline — c97f386
- [x] T5 Validate, docs (brief/handoff pending list) and close — inline — docs commit

## Log

- L1 User request (verbatim, 2026-11-17): the full «Brief de ajustes de la web — Documento de trabajo para Mocklab | 13 de noviembre de 2026» quoted in the session, ending with: "Esto han pasado, habrá cosas que será de que ponga el nuevo logo o el que corresponde y demás, todo lo que neesites interacción mía lo dejas pendiente y todo lo que puedas ejecutar tú lo haces. Cuando termines, pásame el listado de tareas que quedan pendientes de mi interacción"
- L2 Decision (client brief S13): the client now requests the Living Research «Cuéntanos qué te interesa» form, reversing the earlier "participation excluded" decision for this single form only. Voting stays excluded. Real submission is not authorized or configured, so it follows the Contact no-send/no-storage demo pattern until a provider, recipient and privacy text are approved.
- L3 Constraint: #A89F92 on white is about 2.6:1 contrast, below WCAG AA for text. Text accents keep the accessible `brand` token (#746657); stone stays for non-text accents. This needs client confirmation.
- L5 Evidence: `corepack pnpm run validate` 270/270 pass, astro check 0 errors. Headless Chrome desktop screenshots of Studio and Living Research looked correct; the headless mobile capture was not a reliable 390 px viewport, so mobile review stays pending. Slice note: commit 0787909 exceeded ~400 lines (Research restructure plus its tests) as one cohesive unit.
- L4 Pending human input (not executable here): vector logos for e estudio and e living; Cormorant/Montserrat font files and licences; mockups for exact ocre fragments, sizes and image ratios; location, intervention, area, status and four-moment narrative fields for projects (external Mocklab service); e living destination or provisional page; Research model explanations, LR dates, descriptions and links; real form sending (provider, recipient, antispam, privacy/consent text); legal pages and cookies; verified contact data; final team/client lists and logo permissions; domain/SEO/hosting; real-browser responsive review sign-off.

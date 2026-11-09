import type { PublicProject } from '../../src/lib/projects.ts';

// User-supplied narrative, including the corrected PROYECTO and complete VIDA paragraphs.
export const paragraphs = [
  'PERSONA: quién va a vivir allí. Fotografía documental de los propietarios, no retratos posados.  - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut lectus ligula, viverra lobortis ornare nec, lobortis a turpis. In vitae hendrerit sapien, vitae consectetur purus. Morbi sollicitudin quis leo eu fringilla. Nulla efficitur lobortis velit, quis sagittis ante vestibulum quis. Nulla sit amet libero nisi. Aliquam ut commodo metus, quis tempor nisl. Maecenas eu iaculis nibh. Integer porta quis diam sit amet elementum. Etiam feugiat mollis magna a lacinia. Suspendisse potenti. Donec ultrices, lorem et euismod malesuada, purus enim tempus ex, euismod ultricies enim lacus a sapien. Morbi et placerat ligula, fringilla pellentesque augue. Nulla nec pharetra erat.',
  'DESEO: una frase real de esas personas sobre cómo imaginan vivir el espacio. «Aquí nos imaginamos las sobremesas de verano.» - Nulla eget tortor ullamcorper eros commodo tristique. Donec iaculis eget sem sed iaculis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse odio ligula, varius eget ultricies in, molestie eu velit. Sed tempor molestie laoreet. Fusce sit amet odio et dui aliquet lobortis. Proin suscipit justo vitae urna ullamcorper fermentum. Nullam vulputate sapien a purus ornare, in facilisis nulla iaculis. Duis ac neque risus.',
  'PROYECTO: los renders y la documentación. Naturalidad, luz, materialidad, situaciones creíbles. - Cras vehicula neque ac ex gravida, eget rutrum est viverra. Etiam eget bibendum ipsum, et tincidunt lectus. Etiam ullamcorper lectus at nulla tempor, vel ullamcorper turpis semper. Suspendisse cursus, dolor eu tempus iaculis, justo lectus dapibus augue, et hendrerit libero risus vitae mi. Donec et ligula eu ante fermentum blandit sed id risus. In dignissim tempus tellus, ut dapibus augue sodales eu. Morbi diam orci, dapibus et ex sed, sagittis consectetur velit.',
  'OBRA: el proceso de construcción, con los propietarios presentes en él. - Integer dapibus porttitor faucibus. Etiam imperdiet pulvinar ligula. Aliquam fermentum lacinia ligula ut molestie. Donec id fermentum arcu. Pellentesque laoreet pretium tempus. Pellentesque facilisis ligula eu velit vehicula, placerat iaculis nulla tincidunt. Fusce ac eros cursus diam malesuada interdum et nec libero. Sed consectetur urna eu ante consequat lobortis. In in eros diam. Etiam aliquet imperdiet pulvinar.',
  'VIDA: la casa ya habitada. Se vuelve al mismo lugar y se fotografía a esa familia viviendo la escena que había imaginado. - Maecenas lobortis luctus turpis sit amet imperdiet. Proin et ante nec massa egestas consequat sed in elit. Nullam feugiat odio nec magna efficitur, in aliquet urna scelerisque. Proin at dapibus orci, quis vestibulum ante. Nullam imperdiet luctus lacus, ut ornare mi luctus vel. Sed vel placerat massa. Donec tincidunt feugiat sapien. Morbi quis convallis magna. Sed vitae massa et arcu faucibus aliquam vel a sem. Phasellus in aliquet massa. Etiam tincidunt risus tortor, nec molestie felis congue in. Duis non dolor nec nibh lobortis elementum. Nam condimentum lorem ut mollis vehicula. Donec fermentum, elit a ullamcorper dignissim, risus purus euismod sapien, nec tincidunt risus lectus elementum erat. Curabitur consequat ante mauris, quis ullamcorper nunc vestibulum eget.',
];

// Fake storage origin and objects only; the repeated positions mirror the supplied payload.
export const images = [1, 2, 3, 4, 5, 3, 2, 8, 9, 1].map((number) => ({
  url: `https://abcdefghijklmnopqrst.supabase.co/storage/v1/object/public/user-media/fixture/image-${number}.jpeg`,
}));

export const pilotProject: PublicProject = {
  id: '441',
  title: 'Test 4',
  description: paragraphs.join('\n\n'),
  weblink: 'https://example.test/project',
  originalLanguage: null,
  translations: [],
  images,
  category: 'residencial',
  year: '2026',
};

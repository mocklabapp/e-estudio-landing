// Public studio contact details approved as definitive in the client brief.
// The November 2026 brief asks e estudio to re-verify them before launch.
export const studioContact = {
  street: 'Plaça de l’Església, 23',
  locality: '08440 Cardedeu, Barcelona',
  phoneLabel: '+34 615 123 456',
  phoneHref: 'tel:+34615123456',
  email: 'hola@eestudiohabitar.com',
  instagramHandle: '@e_estudio_habitar',
  instagramUrl: 'https://www.instagram.com/e_estudio_habitar/',
} as const;

export const studioAddress = `${studioContact.street}, ${studioContact.locality}`;

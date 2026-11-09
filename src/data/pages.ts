import { site } from '@/config/site';
import type { Locale } from '@/i18n/locales';

export interface PageTranslation {
  slug: string;
  title: string;
  description: string;
  body: string;
}

export interface Page {
  id: string;
  translations: Partial<Record<Locale, PageTranslation>>;
}

// Stable identities connect equivalents even when slugs differ. Omit an optional
// translation until approved and complete; never publish placeholder fallback copy.
export const pages: Page[] = [
  {
    id: 'projects',
    translations: {
      es: { slug: 'proyectos', title: 'Proyectos',
        description: 'Proyectos de arquitectura residencial de e estudio.', body: 'Proyectos' },
      ca: { slug: 'projectes', title: 'Projectes',
        description: 'Projectes d’arquitectura residencial d’e estudio.', body: 'Projectes' },
    },
  },
  {
    id: 'studio',
    translations: { es: {
      slug: 'estudio', title: 'Estudio',
      description: 'Creamos espacios, investigamos nuevas formas de habitar.',
      body: 'Dos trayectorias complementarias. Una misma manera de entender la arquitectura.',
    }, ca: {
      slug: 'estudi', title: 'Estudi',
      description: 'Creem espais, investiguem noves maneres d’habitar.',
      body: 'Dues trajectòries complementàries. Una mateixa manera d’entendre l’arquitectura.',
    } },
  },
  {
    id: 'services',
    translations: { es: {
      slug: 'servicios', title: 'Servicios',
      description: 'Arquitectura para habitar y promover.',
      body: 'Para quienes quieren construir o transformar su hogar.',
    }, ca: {
      slug: 'serveis', title: 'Serveis', description: 'Arquitectura per habitar i promoure.',
      body: 'Per a qui vol construir o transformar la seva llar.',
    } },
  },
  {
    id: 'research',
    translations: { es: {
      slug: 'living-research', title: 'Living Research',
      description: 'Investigamos nuevas formas de habitar.',
      body: 'La forma de habitar está cambiando.',
    }, ca: {
      slug: 'living-research', title: 'Living Research',
      description: 'Investiguem noves maneres d’habitar.', body: 'La manera d’habitar està canviant.',
    } },
  },
  {
    id: 'contact',
    translations: { es: {
      slug: 'contacto', title: 'Contacto',
      description: 'Estamos en la Casa Bot, en el corazón de Cardedeu.',
      body: 'Habitar empieza con una conversación.',
    }, ca: {
      slug: 'contacte', title: 'Contacte', description: 'Som a la Casa Bot, al cor de Cardedeu.',
      body: 'Habitar comença amb una conversa.',
    } },
  },
  {
    id: 'home',
    translations: {
      es: { slug: '', title: site.name, description: site.description, body: site.description },
      ca: { slug: '', title: site.name, description: 'espais pensats per viure.', body: 'espais pensats per viure.' },
      en: {
        slug: '', title: site.name,
        description: 'A clear starting point for your next website.',
        body: 'A clear starting point for your next website.',
      },
    },
  },
];

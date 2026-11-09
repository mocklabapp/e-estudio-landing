import type { Locale } from '../i18n/locales.ts';

// Stable stored values: presentation labels must never replace these identifiers.
export const projectCategoryIds = Object.freeze([
  'residencial',
  'docente',
  'oficinas',
  'planeamiento',
  'industrial',
  'cultural',
  'publico',
  'rehabilitacion',
  'interiorismo',
  'sanitario',
] as const);

export type ProjectCategoryId = (typeof projectCategoryIds)[number];
type CategoryLabels = Readonly<Record<ProjectCategoryId, string>>;

// A registered locale can lack a dictionary; a supplied dictionary must be complete.
export const projectCategoryLabels: Readonly<Partial<Record<Locale, CategoryLabels>>> = {
  es: {
    residencial: 'Residencial',
    docente: 'Docente',
    oficinas: 'Oficinas',
    planeamiento: 'Planeamiento',
    industrial: 'Industrial',
    cultural: 'Cultural',
    publico: 'Espacio público',
    rehabilitacion: 'Rehabilitación',
    interiorismo: 'Interiorismo',
    sanitario: 'Sanitario',
  },
  ca: {
    residencial: 'Residencial',
    docente: 'Docent',
    oficinas: 'Oficines',
    planeamiento: 'Planejament',
    industrial: 'Industrial',
    cultural: 'Cultural',
    publico: 'Espai públic',
    rehabilitacion: 'Rehabilitació',
    interiorismo: 'Interiorisme',
    sanitario: 'Sanitari',
  },
  en: {
    residencial: 'Residential',
    docente: 'Educational',
    oficinas: 'Offices',
    planeamiento: 'Urban planning',
    industrial: 'Industrial',
    cultural: 'Cultural',
    publico: 'Public space',
    rehabilitacion: 'Rehabilitation',
    interiorismo: 'Interior design',
    sanitario: 'Healthcare',
  },
};

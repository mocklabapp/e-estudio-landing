interface Philosophy {
  title: string;
  description: string;
}

interface TeamMember {
  name: string;
  role: 'Arquitecta' | 'Arquitecto' | 'Estructuras';
}

// Copy and role assignments transcribed from the approved studio screenshot.
export const philosophy = [
  { title: 'Espacio', description: 'El lugar y su contexto.' },
  { title: 'Esencia', description: 'Lo que realmente importa.' },
  { title: 'Equilibrio', description: 'Entre la vida de hoy y la de mañana.' },
] as const satisfies readonly Philosophy[];

export const team: readonly TeamMember[] = [
  { name: 'Eva', role: 'Arquitecta' },
  { name: 'Esther', role: 'Arquitecta' },
  { name: 'Ana', role: 'Arquitecta' },
  { name: 'Pep Comermà', role: 'Arquitecto' },
  { name: 'Raúl', role: 'Arquitecto' },
  { name: 'Andrea', role: 'Estructuras' },
];

export const collaborators: readonly string[] = [
  'Generalitat de Catalunya',
  'INCASÒL',
  'Ajuntament de Barcelona',
  'COPCISA',
  'COAC',
];

export const housingModels = [
  'Cohousing',
  'Coliving',
  'Comunidades intergeneracionales',
  'Otras formas de habitar',
] as const;

// Editorial questions only: no dates, events, participation or voting actions.
export const researchQuestions = [
  '¿Cómo queremos vivir cuando seamos mayores?',
  '¿Cómo vivirán nuestros hijos?',
  '¿Qué posibilidades ofrecen los espacios que ya tenemos?',
] as const;

export const researchMethod = [
  'Preguntar',
  'Conversar',
  'Investigar',
  'Explorar',
  'Hacer posible',
] as const;

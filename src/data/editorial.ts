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

/**
 * DRAFT explanations pending client validation (brief L4): neutral, general
 * definitions only, with no claims about e estudio. Keys match `housingModels`.
 */
export const housingModelDefinitions = {
  'Cohousing':
    'Comunidad de viviendas privadas con espacios compartidos, cuya vida cotidiana se organiza entre quienes la habitan.',
  'Coliving':
    'Forma de vivir en la que cada persona dispone de un espacio propio y comparte zonas comunes, como la cocina o la sala de estar.',
  'Comunidades intergeneracionales':
    'Entornos residenciales donde conviven personas de distintas edades y se favorece el apoyo mutuo entre generaciones.',
  'Otras formas de habitar':
    'Otras fórmulas de vivienda que combinan espacio privado y compartido de maneras distintas a los modelos más habituales.',
} as const satisfies Record<(typeof housingModels)[number], string>;

interface ResearchQuestion {
  question: string;
  /** LR01's last sentence is illegible in the mockup and omitted until the client supplies it. */
  description: string;
  meeting: string;
}

// Questions, descriptions and meeting seasons transcribed from the Nov 2026 mockup (S20); no links of their own.
export const researchQuestions = [
  {
    question: '¿Cómo queremos vivir cuando seamos mayores?',
    description: 'Vivimos más años y queremos mantener nuestra autonomía durante más tiempo. ¿Qué necesitamos para seguir viviendo bien?',
    meeting: 'Encuentro · otoño 2026',
  },
  {
    question: '¿Cómo vivirán nuestros hijos?',
    description: 'El acceso a la vivienda está transformando la etapa de la juventud. Queremos investigar qué modelos residenciales pueden responder a esta nueva realidad.',
    meeting: 'Encuentro · invierno 2026',
  },
  {
    question: '¿Qué posibilidades ofrecen los espacios que ya tenemos?',
    description: 'Masías, grandes casas unifamiliares, edificios industriales, hoteles… ¿Podrían albergar nuevas formas de convivencia sin perder su identidad?',
    meeting: 'Encuentro · primavera 2027',
  },
] as const satisfies readonly ResearchQuestion[];

export const researchMethod = [
  { title: 'Preguntar', description: 'Detectamos una necesidad o un cambio.' },
  { title: 'Conversar', description: 'Reunimos a personas y especialistas.' },
  { title: 'Investigar', description: 'Analizamos, aprendemos, compartimos.' },
  { title: 'Explorar', description: 'Desarrollamos posibles respuestas arquitectónicas.' },
  { title: 'Hacer posible', description: 'Si surge la oportunidad, lo convertimos en un proyecto real.' },
] as const;

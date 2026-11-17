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


export const researchMethod = [
  { title: 'Preguntar', description: 'Detectamos una necesidad o un cambio.' },
  { title: 'Conversar', description: 'Reunimos a personas y especialistas.' },
  { title: 'Investigar', description: 'Analizamos, aprendemos, compartimos.' },
  { title: 'Explorar', description: 'Desarrollamos posibles respuestas arquitectónicas.' },
  { title: 'Hacer posible', description: 'Si surge la oportunidad, lo convertimos en un proyecto real.' },
] as const;

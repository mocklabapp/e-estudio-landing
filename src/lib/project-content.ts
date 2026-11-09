import type { PublicProject } from './projects';

export interface ProjectContent {
  language: string;
  source: 'original' | 'translation' | 'missing';
  title: string | null;
  description: string | null;
}

/** Select one exact language without fallback, field mixing or DTO mutation. */
export function selectProjectContent(project: PublicProject, language: string): ProjectContent {
  if (project.originalLanguage === language) {
    return { language, source: 'original', title: project.title, description: project.description };
  }
  const translation = project.translations.find((entry) => entry.language === language);
  if (translation) {
    return { language, source: 'translation', title: translation.title, description: translation.description };
  }
  return { language, source: 'missing', title: null, description: null };
}

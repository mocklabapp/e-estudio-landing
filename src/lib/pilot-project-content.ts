import type { PublicProject } from './projects';
import { selectProjectContent, type ProjectContent } from './project-content.ts';

/** Client presentation: use a complete translation or the whole original, never mixed fields.
 * `language` is the requested presentation locale, not an assertion about the original.
 */
export function selectPilotProjectContent(project: PublicProject, language: string): ProjectContent {
  const selected = selectProjectContent(project, language);
  if (selected.source === 'original' || (selected.source === 'translation'
    && typeof selected.title === 'string' && selected.title.trim().length > 0
    && typeof selected.description === 'string' && selected.description.trim().length > 0)) {
    return selected;
  }
  return { language, source: 'original', title: project.title, description: project.description };
}

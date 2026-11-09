import { getSecret } from 'astro:env/server';
import { fetchPublicProjects } from './projects-client.ts';
import type { ProjectImage } from './project-images.ts';
export type { ProjectImage } from './project-images.ts';

export interface ProjectTranslation {
  language: string;
  title: string | null;
  description: string | null;
}

export interface PublicProject {
  /** Postgres bigint serialized as text, never a JavaScript number. */
  id: string;
  title: string | null;
  description: string | null;
  weblink: string | null;
  originalLanguage: string | null;
  translations: ProjectTranslation[];
  /** Optional for existing hand-authored consumers; fetched projects always normalize these. */
  images?: ProjectImage[];
  category?: string | null;
  year?: string | null;
}

export interface NormalizedPublicProject extends PublicProject {
  images: ProjectImage[];
  category: string | null;
  year: string | null;
}

/** Server-only, fixed-owner public portfolio. Call from an on-demand Astro route. */
export async function getProjects(): Promise<NormalizedPublicProject[]> {
  // Resolve trusted configuration per request; never accept visitor overrides.
  return fetchPublicProjects(getSecret('MOCKLAB_PROJECTS_URL'), getSecret('MOCKLAB_USER_ID'));
}

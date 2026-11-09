import type { NormalizedPublicProject } from './projects.ts';
import { parseProjectImages } from './project-images.ts';

const unavailable = () => new Error('Projects unavailable');

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw unavailable();
  return value as Record<string, unknown>;
}

function text(value: unknown): string | null {
  if (value === null || typeof value === 'string') return value;
  throw unavailable();
}

function language(value: unknown): string {
  if (value === 'es' || value === 'en' || value === 'ca') return value;
  throw unavailable();
}

/** Validate the public Edge envelope, reconstructing only allowlisted fields. */
export function parseProjectsResponse(value: unknown, origin: string): NormalizedPublicProject[] {
  const envelope = record(value);
  if (!Array.isArray(envelope.projects)) throw unavailable();
  let previous = 0n;
  return envelope.projects.map((value: unknown) => {
    const row = record(value);
    if (typeof row.id !== 'string' || !/^[1-9][0-9]{0,18}$/.test(row.id)) throw unavailable();
    const id = BigInt(row.id);
    if (id.toString() !== row.id || id <= previous || id > 9223372036854775807n) throw unavailable();
    previous = id;
    if (!Array.isArray(row.translations)) throw unavailable();
    const seen = new Set<string>();
    const translations = row.translations.map((value: unknown) => {
      const translation = record(value);
      const locale = language(translation.language);
      if (seen.has(locale)) throw unavailable();
      seen.add(locale);
      return { language: locale, title: text(translation.title), description: text(translation.description) };
    });
    return {
      id: row.id,
      title: text(row.title),
      description: text(row.description),
      weblink: text(row.weblink),
      originalLanguage: row.originalLanguage === null ? null : language(row.originalLanguage),
      translations,
      images: Object.hasOwn(row, 'images') ? parseProjectImages(row.images, origin) : [],
      category: Object.hasOwn(row, 'category') ? text(row.category) : null,
      year: Object.hasOwn(row, 'year') ? text(row.year) : null,
    };
  });
}

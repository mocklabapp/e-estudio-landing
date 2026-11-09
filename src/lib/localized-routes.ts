import { publishedPages, type PublishedPage } from '@/i18n/pages';
import type { Locale } from '@/i18n/locales';
import type { PublicProject } from '@/lib/projects';

export function localizedPage(id: string, locale: Locale, projectId?: string): PublishedPage | undefined {
  const page = publishedPages().find(page => page.id === id && page.locale === locale);
  return page && projectId ? { ...page, projectId, path: `${page.path}${projectId}/` } : page;
}

export interface PortfolioResult {
  projects: PublicProject[];
  unavailable: boolean;
}

/** Route owners await live data before rendering so HTTP status is not streamed too early. */
export async function loadPortfolio(load: () => Promise<PublicProject[]>, id?: string): Promise<PortfolioResult> {
  if (id !== undefined && (!/^[1-9][0-9]{0,18}$/.test(id) || BigInt(id) > 9223372036854775807n)) {
    return { projects: [], unavailable: false };
  }
  try {
    return { projects: await load(), unavailable: false };
  } catch {
    return { projects: [], unavailable: true };
  }
}

export function pagePath(id: string, locale: Locale): string {
  const page = localizedPage(id, locale);
  if (!page) throw new Error(`[i18n] Unpublished page ${id}/${locale}.`);
  return page.path;
}

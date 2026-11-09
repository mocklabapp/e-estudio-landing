import { pages, type Page, type PageTranslation } from '../data/pages';
import { defaultLocale, getEnabledLocales, locales, type Locale } from './locales';
import { ui } from './ui';

export interface PublishedPage {
  id: string;
  locale: Locale;
  content: PageTranslation;
  path: string;
  projectId?: string;
}

export function publishedPages(): PublishedPage[] {
  const enabled = getEnabledLocales();
  for (const locale of enabled) {
    const dictionary = ui[locale];
    if (!dictionary?.navigation?.trim() || !dictionary?.languageSwitcher?.trim()) {
      throw new Error(`[i18n] Incomplete UI for ${locale}.`);
    }
  }
  const ids = new Set<string>();
  for (const page of pages) {
    if (ids.has(page.id)) {
      throw new Error(`[i18n] Duplicate page ID ${page.id}.`);
    }
    ids.add(page.id);
  }
  const published = pages.flatMap((page: Page) => {
    if (!page.translations[defaultLocale]) {
      throw new Error(`[i18n] Missing Spanish translation for page ${page.id}.`);
    }
    return enabled.flatMap((locale) => {
      const content = page.translations[locale];
      if (!content) return [];
      if (typeof content.slug !== 'string' ||
          !content.title?.trim() || !content.description?.trim() || !content.body?.trim()) {
        throw new Error(`[i18n] Incomplete translation for ${page.id}/${locale}.`);
      }
      const prefix = locale === defaultLocale ? '' : `${locale}/`;
      const path = `/${prefix}${content.slug ? `${content.slug}/` : ''}`;
      return [{ id: page.id, locale, content, path }];
    });
  });
  const paths = new Map<string, PublishedPage>();
  for (const page of published) {
    const previous = paths.get(page.path);
    if (previous) {
      throw new Error(`[i18n] Colliding published path ${page.path}: ${previous.id}/${previous.locale} and ${page.id}/${page.locale}.`);
    }
    paths.set(page.path, page);
  }
  return published;
}

export function equivalents(page: PublishedPage): PublishedPage[] {
  return publishedPages().filter(({ id }) => id === page.id).map((alternate) =>
    page.projectId ? { ...alternate, projectId: page.projectId,
      path: `${alternate.path}${page.projectId}/` } : alternate);

}

export { locales };

import { publishedPages } from '@/i18n/pages';
import type { Locale } from '@/i18n/locales';

const navigationIds = ['studio', 'projects', 'services', 'research', 'contact'];

export function navigationFor(locale: Locale) {
  const pages = publishedPages();
  return navigationIds.flatMap(id => {
    const page = pages.find(page => page.id === id && page.locale === locale);
    return page ? [{ href: page.path, label: page.content.title }] : [];
  });
}

export const navigation = navigationFor('es');

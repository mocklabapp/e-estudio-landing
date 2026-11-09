// Add approved locale metadata here; all consumers derive their locale types/list.
export const locales = {
  es: { label: 'Español', lang: 'es', dir: 'ltr' },
  ca: { label: 'Català', lang: 'ca', dir: 'ltr' },
  en: { label: 'English', lang: 'en', dir: 'ltr' },
} as const satisfies Record<string, { label: string; lang: string; dir: 'ltr' | 'rtl' }>;

export type Locale = keyof typeof locales;
export const defaultLocale = 'es' satisfies Locale;
// Spanish is mandatory; other registered languages are opt-in per client.
export const enabledLocales: readonly string[] = ['es', 'ca'];

export function getEnabledLocales(): Locale[] {
  if (!enabledLocales.includes(defaultLocale)) {
    throw new Error('[i18n] Spanish (es) must be enabled.');
  }
  for (const locale of enabledLocales) {
    if (!(locale in locales)) throw new Error(`[i18n] Unknown enabled locale: ${locale}.`);
  }
  return [...new Set(enabledLocales)] as Locale[];
}

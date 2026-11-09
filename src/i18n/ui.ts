import type { Locale } from './locales';

export interface UI {
  navigation: string;
  languageSwitcher: string;
}

export const ui: Record<Locale, UI> = {
  es: { navigation: 'Navegación de idiomas', languageSwitcher: 'Idioma' },
  ca: { navigation: 'Navegació d’idiomes', languageSwitcher: 'Idioma' },
  en: { navigation: 'Language navigation', languageSwitcher: 'Language' },
};

import { defaultLocale, locales } from '../i18n/locales.ts';

export const site = {
  name: 'e estudio',
  description: 'espacios pensados para vivir.',
  language: locales[defaultLocale].lang,
} as const;

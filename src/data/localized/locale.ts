export type ClientLocale = 'es' | 'ca';

/** Client components are rendered only for ES/CA; standalone previews default to ES. */
export function clientLocale(locale: string | undefined): ClientLocale {
  return locale === 'ca' ? 'ca' : 'es';
}

/** Exact, typed source-copy keys keep the approved Spanish wording unchanged. */
export function localize<T extends Record<string, string>>(locale: string | undefined, catalan: T) {
  return (spanish: keyof T & string): string => locale === 'ca' ? catalan[spanish] : spanish;
}

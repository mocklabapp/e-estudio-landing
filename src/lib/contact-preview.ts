import { enhanceFormPreview } from './form-preview/enhance.ts';
import {
  formLocale, isEmail, previewResult, validateRequiredText,
  type PreviewResult,
} from './form-preview/validation.ts';

export interface ContactPreviewValues {
  name: string;
  contact: string;
  subject: string;
  message: string;
}

type ContactField = keyof ContactPreviewValues;

const contactFields: ContactField[] = ['name', 'contact', 'subject', 'message'];
const contactLimits: Record<ContactField, number> = {
  name: 120,
  contact: 160,
  subject: 160,
  message: 3000,
};

const contactMessages = {
  es: {
    contact: 'Introduce un email o teléfono válido para la simulación.',
    success: 'Simulación completada. No se ha enviado ningún mensaje ni se han guardado datos.',
    invalid: 'Revisa los campos indicados. No se ha enviado ni guardado ningún dato.',
  },
  ca: {
    contact: 'Introdueix un correu electrònic o telèfon vàlid per a la simulació.',
    success: 'Simulació completada. No s’ha enviat cap missatge ni s’han guardat dades.',
    invalid: 'Revisa els camps indicats. No s’ha enviat ni guardat cap dada.',
  },
} as const;

/** A local preview only: values are neither persisted nor returned in feedback. */
export function simulateContactPreview(
  values: ContactPreviewValues,
  locale = 'es',
): PreviewResult<ContactField> {
  const language = formLocale(locale);
  const copy = contactMessages[language];
  const errors = validateRequiredText(contactFields, values, contactLimits, language);
  const contact = values.contact.trim();
  const digits = contact.replace(/\D/g, '').length;
  const phone = /^[+()\d\s.-]+$/.test(contact) && digits >= 7 && digits <= 15;
  if (!errors.contact && !isEmail(contact) && !phone) errors.contact = copy.contact;
  return previewResult(errors, copy.success, copy.invalid);
}

export function enhanceContactPreview(root: HTMLElement, locale = 'es'): void {
  enhanceFormPreview(root, {
    prefix: 'contact',
    fields: contactFields,
    validate: values => simulateContactPreview(values, locale),
  });
}

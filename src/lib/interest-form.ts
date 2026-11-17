import { enhanceFormPreview } from './form-preview/enhance.ts';
import {
  formLocale, isEmail, previewResult, validateRequiredText,
  type PreviewResult,
} from './form-preview/validation.ts';

export interface InterestPreviewValues {
  name: string;
  email: string;
  message: string;
}

type InterestField = keyof InterestPreviewValues;

const interestFields: InterestField[] = ['name', 'email', 'message'];
const interestLimits: Record<InterestField, number> = { name: 120, email: 160, message: 3000 };

const interestMessages = {
  es: {
    email: 'Introduce un email válido para la simulación.',
    success: 'Simulación completada. No se ha enviado ningún mensaje ni se han guardado datos.',
    invalid: 'Revisa los campos indicados. No se ha enviado ni guardado ningún dato.',
  },
  ca: {
    email: 'Introdueix un correu electrònic vàlid per a la simulació.',
    success: 'Simulació completada. No s’ha enviat cap missatge ni s’han guardat dades.',
    invalid: 'Revisa els camps indicats. No s’ha enviat ni guardat cap dada.',
  },
} as const;

/** A local preview only: values are neither persisted nor returned in feedback. */
export function simulateInterestPreview(
  values: InterestPreviewValues,
  locale = 'es',
): PreviewResult<InterestField> {
  const language = formLocale(locale);
  const copy = interestMessages[language];
  const errors = validateRequiredText(interestFields, values, interestLimits, language);
  if (!errors.email && !isEmail(values.email)) errors.email = copy.email;
  return previewResult(errors, copy.success, copy.invalid);
}

export function enhanceInterestPreview(root: HTMLElement, locale = 'es'): void {
  enhanceFormPreview(root, {
    prefix: 'interest',
    fields: interestFields,
    validate: values => simulateInterestPreview(values, locale),
  });
}

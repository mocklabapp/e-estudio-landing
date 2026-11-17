export type FormLocale = 'es' | 'ca';
export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

export interface PreviewResult<Field extends string> {
  valid: boolean;
  errors: FieldErrors<Field>;
  status: string;
}

interface FieldMessages {
  required: string;
  limit: (maximum: number) => string;
}

/** Shared by the Contact and Research demo forms; both locales are mandatory. */
const fieldMessages: Record<FormLocale, FieldMessages> = {
  es: {
    required: 'Completa este campo.',
    limit: maximum => `Usa un máximo de ${maximum} caracteres.`,
  },
  ca: {
    required: 'Completa aquest camp.',
    limit: maximum => `Fes servir un màxim de ${maximum} caràcters.`,
  },
};

export function formLocale(locale: string | undefined): FormLocale {
  return locale === 'ca' ? 'ca' : 'es';
}

/** Pure check for required, non-blank text within each field's length limit. */
export function validateRequiredText<Field extends string>(
  fields: readonly Field[],
  values: Record<Field, string>,
  limits: Record<Field, number>,
  locale: FormLocale,
): FieldErrors<Field> {
  const copy = fieldMessages[locale];
  const errors: FieldErrors<Field> = {};
  for (const field of fields) {
    if (!values[field].trim()) errors[field] = copy.required;
    else if (values[field].length > limits[field]) errors[field] = copy.limit(limits[field]);
  }
  return errors;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Compose the final result from field errors and the form's two status messages. */
export function previewResult<Field extends string>(
  errors: FieldErrors<Field>,
  success: string,
  invalid: string,
): PreviewResult<Field> {
  const valid = Object.keys(errors).length === 0;
  return { valid, errors, status: valid ? success : invalid };
}

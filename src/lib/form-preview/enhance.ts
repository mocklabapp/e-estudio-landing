import type { PreviewResult } from './validation.ts';

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface PreviewConfig<Field extends string> {
  /** Controls are `#<prefix>-<field>`, plus `#<prefix>-simulate` and `#<prefix>-status`. */
  prefix: string;
  fields: readonly Field[];
  validate: (values: Record<Field, string>) => PreviewResult<Field>;
}

/**
 * Enhance a non-native form group, keeping the no-JavaScript state inert.
 * It validates locally and announces the result: no network, storage or navigation.
 */
export function enhanceFormPreview<Field extends string>(
  root: HTMLElement,
  { prefix, fields, validate }: PreviewConfig<Field>,
): void {
  const controls = new Map<Field, Control>();
  for (const field of fields) {
    const control = root.querySelector<Control>(`#${prefix}-${field}`);
    if (!control) return;
    controls.set(field, control);
  }
  const button = root.querySelector<HTMLButtonElement>(`#${prefix}-simulate`);
  const status = root.querySelector<HTMLElement>(`#${prefix}-status`);
  if (!button || !status) return;

  for (const control of controls.values()) {
    control.addEventListener('input', () => {
      control.setCustomValidity('');
      control.removeAttribute('aria-invalid');
      status.textContent = '';
    });
  }
  button.addEventListener('click', () => {
    const values = {} as Record<Field, string>;
    for (const [field, control] of controls) values[field] = control.value;
    const result = validate(values);
    for (const [field, control] of controls) {
      const error = result.errors[field];
      control.setCustomValidity(error ?? '');
      control.setAttribute('aria-invalid', String(Boolean(error)));
    }
    status.textContent = result.status;
    const firstInvalid = fields.find(field => result.errors[field]);
    const invalidControl = firstInvalid && controls.get(firstInvalid);
    if (invalidControl) {
      invalidControl.focus();
      invalidControl.reportValidity();
    }
  });
  button.disabled = false;
}

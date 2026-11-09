export interface ContactPreviewValues {
  name: string;
  contact: string;
  subject: string;
  message: string;
}

type ContactField = keyof ContactPreviewValues;
interface SimulationResult {
  valid: boolean;
  errors: Partial<Record<ContactField, string>>;
  status: string;
}

const fields: ContactField[] = ['name', 'contact', 'subject', 'message'];
const limits: Record<ContactField, number> = {
  name: 120,
  contact: 160,
  subject: 160,
  message: 3000,
};

interface SimulationMessages {
  required: string;
  limit: (maximum: number) => string;
  contact: string;
  success: string;
  invalid: string;
}
const messages: Record<'es' | 'ca', SimulationMessages> = {
  es: {
    required: 'Completa este campo.',
    limit: maximum => `Usa un máximo de ${maximum} caracteres.`,
    contact: 'Introduce un email o teléfono válido para la simulación.',
    success: 'Simulación completada. No se ha enviado ningún mensaje ni se han guardado datos.',
    invalid: 'Revisa los campos indicados. No se ha enviado ni guardado ningún dato.',
  },
  ca: {
    required: 'Completa aquest camp.',
    limit: maximum => `Fes servir un màxim de ${maximum} caràcters.`,
    contact: 'Introdueix un correu electrònic o telèfon vàlid per a la simulació.',
    success: 'Simulació completada. No s’ha enviat cap missatge ni s’han guardat dades.',
    invalid: 'Revisa els camps indicats. No s’ha enviat ni guardat cap dada.',
  },
};

/** A local preview only: values are neither persisted nor returned in feedback. */
export function simulateContactPreview(values: ContactPreviewValues, locale = 'es'): SimulationResult {
  const copy = messages[locale === 'ca' ? 'ca' : 'es'];
  const errors: SimulationResult['errors'] = {};
  for (const field of fields) {
    if (!values[field].trim()) errors[field] = copy.required;
    else if (values[field].length > limits[field]) {
      errors[field] = copy.limit(limits[field]);
    }
  }
  const contact = values.contact.trim();
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const digits = contact.replace(/\D/g, '').length;
  const phone = /^[+()\d\s.-]+$/.test(contact) && digits >= 7 && digits <= 15;
  if (!errors.contact && !email && !phone) {
    errors.contact = copy.contact;
  }
  const valid = Object.keys(errors).length === 0;
  return {
    valid,
    errors,
    status: valid ? copy.success : copy.invalid,
  };
}

/** Enhance a non-native form group, keeping the no-JavaScript state inert. */
export function enhanceContactPreview(root: HTMLElement, locale = 'es'): void {
  const name = root.querySelector<HTMLInputElement>('#contact-name');
  const contact = root.querySelector<HTMLInputElement>('#contact-contact');
  const subject = root.querySelector<HTMLSelectElement>('#contact-subject');
  const message = root.querySelector<HTMLTextAreaElement>('#contact-message');
  const button = root.querySelector<HTMLButtonElement>('#contact-simulate');
  const status = root.querySelector<HTMLElement>('#contact-status');
  if (!name || !contact || !subject || !message || !button || !status) return;

  const controls = { name, contact, subject, message };
  for (const field of fields) {
    controls[field].addEventListener('input', () => {
      controls[field].setCustomValidity('');
      controls[field].removeAttribute('aria-invalid');
      status.textContent = '';
    });
  }
  button.addEventListener('click', () => {
    const result = simulateContactPreview({
      name: name.value,
      contact: contact.value,
      subject: subject.value,
      message: message.value,
    }, locale);
    for (const field of fields) {
      const error = result.errors[field];
      controls[field].setCustomValidity(error ?? '');
      controls[field].setAttribute('aria-invalid', String(Boolean(error)));
    }
    status.textContent = result.status;
    const firstInvalid = fields.find(field => result.errors[field]);
    if (firstInvalid) {
      controls[firstInvalid].focus();
      controls[firstInvalid].reportValidity();
    }
  });
  button.disabled = false;
}

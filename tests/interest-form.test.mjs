// @ts-check
// Interest-form validation and enhancement (Living Research demo form; no network or storage).
import assert from 'node:assert/strict';
import test from 'node:test';
import { enhanceInterestPreview, simulateInterestPreview } from '../src/lib/interest-form.ts';

test('interest validation requires every field, a valid email and bounded length', () => {
  const valid = { name: 'Prueba', email: 'demo@example.test', message: 'Mensaje de prueba.' };
  assert.equal(simulateInterestPreview(valid).valid, true);
  assert.match(simulateInterestPreview(valid).status, /Simulación completada.*No se ha enviado/);
  const empty = simulateInterestPreview({ name: ' ', email: '', message: '' });
  assert.deepEqual(Object.keys(empty.errors), ['name', 'email', 'message']);
  assert.equal(empty.valid, false);
  assert.ok(simulateInterestPreview({ ...valid, email: 'no-email' }).errors.email);
  assert.ok(simulateInterestPreview({ ...valid, email: '+34 600 000 000' }).errors.email, 'A phone is not an email');
  assert.ok(simulateInterestPreview({ ...valid, message: 'x'.repeat(3001) }).errors.message);
  const catalan = simulateInterestPreview(valid, 'ca');
  assert.match(catalan.status, /Simulació completada.*No s’ha enviat/);
  assert.match(simulateInterestPreview({ ...valid, name: '' }, 'ca').errors.name ?? '', /Completa aquest camp/);
});

/** Minimal DOM surface for the real enhancement; not a browser substitute. */
class Control {
  value = '';
  textContent = '';
  disabled = true;
  validityMessage = '';
  /** @type {Map<string, string>} */ attributes = new Map();
  /** @type {Map<string, (() => void)[]>} */ listeners = new Map();
  /** @param {string} event @param {() => void} listener */
  addEventListener(event, listener) { this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]); }
  /** @param {string} event */
  fire(event) { for (const listener of this.listeners.get(event) ?? []) listener(); }
  /** @param {string} name @param {string} value */
  setAttribute(name, value) { this.attributes.set(name, value); }
  /** @param {string} name */
  removeAttribute(name) { this.attributes.delete(name); }
  /** @param {string} message */
  setCustomValidity(message) { this.validityMessage = message; }
  reportValidity() { return !this.validityMessage; }
  focus() {}
}

test('interest enhancement enables the button, announces results and stays inert otherwise', () => {
  const controls = new Map(['name', 'email', 'message', 'simulate', 'status']
    .map((id) => [`#interest-${id}`, new Control()]));
  /** @param {string} id */
  const control = (id) => /** @type {Control} */ (controls.get(`#interest-${id}`));
  // @ts-expect-error The fake root only implements querySelector.
  enhanceInterestPreview({ querySelector: (selector) => controls.get(selector) ?? null }, 'es');
  assert.equal(control('simulate').disabled, false);
  control('simulate').fire('click');
  assert.match(control('status').textContent, /Revisa/);
  assert.equal(control('name').attributes.get('aria-invalid'), 'true');
  control('name').value = 'Prueba';
  control('email').value = 'demo@example.test';
  control('message').value = 'Hola';
  control('simulate').fire('click');
  assert.match(control('status').textContent, /Simulación completada/);
  control('message').fire('input');
  assert.equal(control('status').textContent, '');
  // @ts-expect-error Missing controls leave the preview inert.
  assert.doesNotThrow(() => enhanceInterestPreview({ querySelector: () => null }, 'es'));
});

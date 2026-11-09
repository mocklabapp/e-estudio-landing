// @ts-check
import { registerHooks } from 'node:module';

/** Isolated runtime configuration: never read the host environment. @type {Record<string, string | undefined>} */
export const configuration = {};
/** @type {string[]} */
export const reads = [];
/** @param {string} name */
export function getSecret(name) {
  reads.push(name);
  return configuration[name];
}

// Replace only Astro's environment bridge; retain the real consumer and API route.
registerHooks({ resolve(specifier, context, next) {
  if (specifier === 'astro:env/server') return { shortCircuit: true, url: import.meta.url };
  return next(specifier, context);
} });

// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import { defaultLocale, getEnabledLocales } from './src/i18n/locales.ts';

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  i18n: {
    defaultLocale,
    locales: getEnabledLocales(),
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

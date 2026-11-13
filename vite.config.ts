import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Resolve the tag ID at build time.
 * Priority: GTM_ID env var > public/config.js > config.js
 */
function resolveTagId(): string {
  const fromEnv = process.env.GTM_ID?.trim();
  if (fromEnv) return fromEnv;
  for (const file of ['public/config.js', 'config.js']) {
    try {
      const src = readFileSync(file, 'utf8');
      const m = src.match(/GTM_ID\s*=\s*['"]([^'"]*)['"]/);
      if (m && m[1].trim()) return m[1].trim();
    } catch {
      // file not found; try next
    }
  }
  return '';
}

/**
 * When the ID is a Google Tag Manager container (GTM-XXXX), inject the
 * <noscript> iframe right after <body>. The <head> snippet is loaded at
 * runtime from config.js (see index.html), so only the noscript part,
 * which cannot depend on JavaScript, is embedded at build time.
 */
function gtmNoscript(): Plugin {
  return {
    name: 'gtm-noscript',
    transformIndexHtml() {
      const id = resolveTagId();
      if (!/^GTM-[A-Z0-9]+$/i.test(id)) return [];
      return [
        {
          tag: 'noscript',
          injectTo: 'body-prepend',
          children: `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
        },
      ];
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    gtmNoscript()
  ],
  server: {
    port: 3000,
    host: true
  }
});

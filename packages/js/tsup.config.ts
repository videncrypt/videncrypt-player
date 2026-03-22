import { defineConfig } from 'tsup';

export default defineConfig([
  // ── npm package: ESM + CJS ────────────────────────────
  {
    entry:      { ve: 'src/index.ts' },
    format:     ['esm', 'cjs'],
    dts:        true,
    clean:      true,
    sourcemap:  true,
    outDir:     'dist',
    outExtension({ format }) {
      return { js: format === 'esm' ? '.mjs' : '.cjs' };
    },
  },

  // ── CDN / script tag: IIFE (window.VidEncrypt) ────────
  {
    entry:        { ve: 'src/index.ts' },
    format:       ['iife'],
    globalName:   'VidEncrypt',
    minify:       true,
    sourcemap:    true,
    outDir:       'dist',
    outExtension: () => ({ js: '.js' }),
  },
]);
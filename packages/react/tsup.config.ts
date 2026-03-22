import { defineConfig } from 'tsup';

export default defineConfig({
  entry:      ['src/index.ts'],
  format:     ['esm', 'cjs'],
  dts:        true,
  clean:      true,
  sourcemap:  true,
  external:   ['react', 'react-dom', '@videncrypt/js'],
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.cjs' };
  },
});
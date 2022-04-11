import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  css: { modules: { localsConvention: 'camelCase' } },
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
});

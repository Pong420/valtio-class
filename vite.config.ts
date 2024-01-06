import path from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';

const formats = ['es'] as const;

export default defineConfig({
  plugins: [dts({ exclude: ['**/*.test.ts'] })],
  build: {
    target: 'esnext',
    sourcemap: true,
    minify: false,
    emptyOutDir: true,
    lib: {
      entry: path.join('src', 'index.ts')
    },
    rollupOptions: {
      output: formats.map(format => ({
        preserveModules: true,
        format,
        entryFileNames: `[name].${format === 'es' ? 'js' : 'cjs'}`
      })),
      external: [/node_modules/, 'valtio', /valtio\/.*/]
    }
  }
});

import fs from 'fs';
import path from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';
import { builtinModules } from 'module';

const formats = ['es'] as const;

const deps = [path.join(__dirname, 'package.json')].reduce((deps, pathname) => {
  if (pathname.endsWith('package.json')) {
    const pkg = JSON.parse(fs.readFileSync(pathname, 'utf-8')) as Record<string, unknown>;
    return [
      ...deps,
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.optionalDependencies || {})
    ];
  }
  return deps;
}, [] as string[]);

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
      external: [
        /node_modules/,
        'react/jsx-runtime',
        'protobufjs/minimal',
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
        ...Array.from(new Set(deps), d => new RegExp(`^${d}`))
      ]
    }
  }
});

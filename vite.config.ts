import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { readFileSync, writeFileSync } from 'fs';
import * as esbuild from 'esbuild';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Generate banner
const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * 
 * @author ${pkg.author}
 * @license ${pkg.license}
 * @homepage ${pkg.homepage}
 */`;

const oneLineBanner = `/*! ${pkg.name} v${pkg.version} | ${pkg.license} License | ${pkg.homepage} */`;

// Plugin to generate minified versions
const minifyPlugin = () => ({
  name: 'minify-output',
  async writeBundle(options: any, bundle: any) {
    const files = Object.keys(bundle);
    
    for (const file of files) {
      if (file.endsWith('.js') && !file.endsWith('.min.js')) {
        const chunk = bundle[file];
        if (chunk.type === 'chunk') {
          const code = chunk.code;
          const hasSourcemap = !!chunk.map;
          
          const minified = await esbuild.transform(code, {
            format: file.includes('.esm.') ? 'esm' : file.includes('.common.') ? 'cjs' : 'iife',
            minify: true,
            legalComments: 'none',
            sourcemap: hasSourcemap ? 'external' : false,
            sourcefile: file,
          });
          
          const minFileName = file.replace('.js', '.min.js');
          const minCode = `${oneLineBanner}\n${minified.code}`;
          
          // Generate sourcemap for minified file if available
          if (minified.map) {
            const mapFileName = `${minFileName}.map`;
            // esbuild returns sourcemap as string when sourcemap: 'external'
            const mapContent = typeof minified.map === 'string' 
              ? minified.map 
              : JSON.stringify(minified.map);
            writeFileSync(resolve(options.dir, mapFileName), mapContent);
            
            // Update sourcemap reference in minified file
            const updatedMinCode = `${minCode}\n//# sourceMappingURL=${mapFileName}`;
            writeFileSync(resolve(options.dir, minFileName), updatedMinCode);
          } else {
            writeFileSync(resolve(options.dir, minFileName), minCode);
          }
        }
      }
    }
  },
});

export default defineConfig({
  plugins: [
    dts({
      outDir: 'dist',
      insertTypesEntry: false,
      copyDtsFiles: false,
      include: ['src/**/*'],
    }),
    minifyPlugin(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'hotkeys',
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) => {
        if (format === 'es') return 'hotkeys.esm.js';
        if (format === 'cjs') return 'hotkeys.common.js';
        if (format === 'iife') return 'hotkeys.js';
        return 'hotkeys.js';
      },
    },
    rollupOptions: {
      output: {
        banner,
      },
    },
    minify: false, // We minify in plugin
    sourcemap: true,
    target: 'es2015',
  },
});

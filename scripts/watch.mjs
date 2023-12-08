
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import { watch } from 'rollup';
import { multibanner } from 'bannerjs';
import { babel } from '@rollup/plugin-babel';
import 'colors-cli/toxic';

const watchOptions = {
  input: 'src/index.js',
  plugins: [
    nodeResolve(), // so Rollup can find `ms`
    commonjs(), // so Rollup can convert `ms` to an ES module
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**', // 只编译我们的源代码
      presets: [[
        '@babel/preset-env', {
          /**
           * Do not transpile typeof helper with itself
           * https://github.com/babel/babel/pull/10788/files
           */
          exclude: ['@babel/plugin-transform-typeof-symbol'],
        },
      ]],
    }),
  ],
  output: [
    {
      file: 'dist/hotkeys.common.js',
      name: 'hotkeys',
      exports: 'auto',
      banner: multibanner(),
      format: 'cjs',
    },
    {
      file: 'dist/hotkeys.js',
      name: 'hotkeys',
      banner: multibanner(),
      format: 'umd',
    },
    {
      file: 'dist/hotkeys.esm.js',
      name: 'hotkeys',
      banner: multibanner(),
      format: 'es',
    },
  ],
};
const watcher = watch(watchOptions);

watcher.on('event', (event) => {
  if (event.code === 'FATAL') {
    console.log('FATAL:', event.error.codeFrame);
  }
  // event.code can be one of:
  //   START        — the watcher is (re)starting
  //   BUNDLE_START — building an individual bundle
  //   BUNDLE_END   — finished building a bundle
  //   END          — finished building all bundles
  //   ERROR        — encountered an error while bundling
  //   FATAL        — encountered an unrecoverable error
  if (event.code === 'BUNDLE_END') {
    event.output.forEach((item) => {
      console.log('bundles '.x39 + `${event.input} → ${item.replace(process.cwd() + path.sep, '')}`.blue_bt);
    });
    console.log(`duration ${event.duration}ms\n`.green);
  } else if (event.code === 'END') {
    console.log('waiting for changes... ');
  }
});

// stop watching
// watcher.close();

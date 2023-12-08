import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import { rollup } from 'rollup';
import { multibanner, onebanner } from 'bannerjs';
import { babel } from '@rollup/plugin-babel';
import uglify from 'uglify-js';
import 'colors-cli/toxic';

// see below for details on the options
const inputOptions = {
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
};

async function build() {
  // create a bundle
  const bundle = await rollup(inputOptions);

  const uglifyOption = {
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
    },
    output: {
      ascii_only: true,
    },
  };

  // console.log(bundle.imports); // an array of external dependencies
  // console.log(bundle.exports); // an array of names exported by the entry point
  // console.log(bundle.modules); // an array of module objects

  const umd = await bundle.generate({
    format: 'umd',
    name: 'hotkeys',
    banner: multibanner(),
  });

  const umdMinified = `${onebanner()}\n${uglify.minify(umd.output[0].code, uglifyOption).code}`;

  const common = await bundle.generate({
    format: 'cjs',
    name: 'hotkeys',
    exports: 'auto',
    banner: multibanner(),
  });
  const commonMinified = `${onebanner()}\n${uglify.minify(common.output[0].code, uglifyOption).code}`;

  const es = await bundle.generate({
    format: 'es',
    name: 'hotkeys',
    banner: multibanner(),
  });

  write('dist/hotkeys.js', umd.output[0].code)
    .then(() => write('dist/hotkeys.min.js', umdMinified, true))
    .then(() => write('dist/hotkeys.common.js', common.output[0].code))
    .then(() => write('dist/hotkeys.common.min.js', commonMinified, true))
    .then(() => write('dist/hotkeys.esm.js', es.output[0].code));
}

build();

function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report(extra) {
      console.log(`${(path.relative(process.cwd(), dest)).blue_bt} ${getSize(code).green_bt + (extra || '')}`);
      resolve();
    }
    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest));
    }
    fs.writeFile(dest, code, (err) => {
      if (err) return reject(err);
      if (zip) {
        zlib.gzip(code, (_err, zipped) => {
          if (_err) return reject(_err);
          report(`(gzipped: ${getSize(zipped).green_bt})`);
        });
      } else {
        report();
      }
    });
  });
}

function getSize(code) {
  if (code) {
    return `${(code.toString().length / 1024).toFixed(2)}kb`;
  }
  return '';
}

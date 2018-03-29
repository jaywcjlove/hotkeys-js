const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const banner = require('bannerjs');
const zlib = require('zlib');
// const pkg = require('../package.json');
const uglify = require('uglify-js');
require('colors-cli/toxic');

// see below for details on the options
const inputOptions = {
  input: 'src/main.js',
  plugins: [
    nodeResolve(), // so Rollup can find `ms`
    commonjs(), // so Rollup can convert `ms` to an ES module
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
    }),
  ],
};

async function build() {
  // create a bundle
  const bundle = await rollup.rollup(inputOptions);

  const uglifyOption = {
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false,
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
    banner: banner.multibanner(),
  });

  const umdMinified = `${banner.onebanner()}\n${uglify.minify(umd.code, uglifyOption).code}`;

  const common = await bundle.generate({
    format: 'cjs',
    name: 'hotkeys',
    banner: banner.multibanner(),
  });
  const commonMinified = `${banner.onebanner()}\n${uglify.minify(common.code, uglifyOption).code}`;

  const es = await bundle.generate({
    format: 'es',
    name: 'hotkeys',
    banner: banner.multibanner(),
  });

  write('dist/hotkeys.js', umd.code)
    .then(() => write('dist/hotkeys.min.js', umdMinified, true))
    .then(() => write('dist/hotkeys.common.js', common.code))
    .then(() => write('dist/hotkeys.common.min.js', commonMinified, true))
    .then(() => write('dist/hotkeys.esm.js', es.code));
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
  return `${(code.length / 1024).toFixed(2)}kb`;
}

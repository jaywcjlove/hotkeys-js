import path from 'path';
import webpack from 'webpack';
import lessModules from '@kkt/less-modules';
import rawModules from '@kkt/raw-modules';
import scopePluginOptions from '@kkt/scope-plugin-options';
import pkg from './package.json';

export default (conf, env, options) => {
  conf = lessModules(conf, env, options);
  conf = rawModules(conf, env, options);
  conf = scopePluginOptions(conf, env, {
    ...options,
    allowedFiles: [path.resolve(process.cwd(), 'README.md')],
  });
  // Get the project version.
  conf.plugins.push(
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(pkg.version),
    })
  );

  conf.optimization = {
    ...conf.optimization,
    splitChunks: {
      cacheGroups: {
        reactvendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react-vendor',
          chunks: 'all',
        },
        refractor: {
          test: /[\\/]node_modules[\\/](refractor)[\\/]/,
          name: 'refractor-vendor',
          chunks: 'all',
        },
      },
    },
  };
  if (env === 'production') {
    conf.output = { ...conf.output, publicPath: './' };
  }
  return conf;
}


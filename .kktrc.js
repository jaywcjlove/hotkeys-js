import path from 'path';
import webpack from 'webpack';
import lessModules from '@kkt/less-modules';
import rawModules from '@kkt/raw-modules';
import { disableScopePlugin } from '@kkt/scope-plugin-options';
import scopePluginOptions from '@kkt/scope-plugin-options';
import pkg from './package.json';

export default (conf, env, options) => {
  conf = lessModules(conf, env, options);
  conf = rawModules(conf, env, options);
  conf = disableScopePlugin(conf);
  conf = scopePluginOptions(conf, env, {
    ...options,
    allowedFiles: [
      path.resolve(process.cwd(), 'README.md'),
      path.resolve(process.cwd(), 'src')
    ],
  });
  conf.ignoreWarnings = [
    { module: /node_modules[\\/]parse5[\\/]/ }
  ];
  // Get the project version.
  conf.plugins.push(
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(pkg.version),
    })
  );

  if (env === 'production') {
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
    conf.output = { ...conf.output, publicPath: './' };
  }
  return conf;
}


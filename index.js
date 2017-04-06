const { merge } = require('lodash');
const neutrinoWeb = require('neutrino-preset-web');
const { join } = require('path');

const MODULES = join(__dirname, 'node_modules');

module.exports = (neutrino, options) => {
  neutrino.options.entry = './src/index.ts';
  neutrino.options.copy = merge({ patterns: ['*.ts*'] }, neutrino.options.copy);

  neutrino.use(neutrinoWeb);
  neutrino.config.module.rules.delete('compile');

  const compileOptions = merge({
    sourceMap: true,
    noImplicitAny: true,
    module: 'commonjs',
    target: 'es5',
    jsx: 'react'
  }, options.compile);

  neutrino.config
    .entry('index')
      .clear()
      .add(neutrino.options.entry)
      .end()
    .resolve
      .modules
        .add(MODULES)
        .end()
      .extensions
        .clear()
        .add('.ts')
        .add('.tsx')
        .add('.js')
        .add('.json')
        .end()
      .end()
    .resolveLoader
      .modules
        .add(MODULES)
        .end()
      .end()
    .module
      .rule('sourcemap')
        .test(/\.js$/)
        .pre()
        .use('sourcemap')
          .loader(require.resolve('source-map-loader'))
          .end()
        .end()
      .rule('compile')
        .clear()
        .test(options.test || /\.(ts|tsx)$/)
        .when(options.include, rule => rule.include.merge(options.include))
        .when(options.exclude, rule => rule.exclude.merge(options.exclude))
        .use('typescript')
          .loader(require.resolve('awesome-typescript-loader'))
          .options(compileOptions)
          .end()
        .end()
      .end()
    .externals({
      'react/addons': true,
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': 'window'
    })
    .when(process.env.NODE_ENV === 'development', (config) => {
      const ds = config.devServer;
      const protocol = ds.get('https') ? 'https' : 'http';
      config
        .entry('index')
          .prepend(require.resolve('react-hot-loader/patch'))
          .add(`webpack-dev-server/client?${protocol}://${ds.get('host')}:${ds.get('port')}/`)
          .add('webpack/hot/dev-server');
    });
};
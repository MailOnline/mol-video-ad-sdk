/* eslint-disable import/unambiguous, import/no-commonjs, sort-keys, global-require, no-process-env */
const webpackConfig = require('./webpack.config');

let browsers = ['Chrome', 'Firefox'];

if (process.env.KARMA_BROWSERS) {
  browsers = process.env.KARMA_BROWSERS.split(',');
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      './packages/*/src/**/__karma__/**/*.spec.js'
    ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers,
    singleRun: true,
    concurrency: Infinity,
    preprocessors: {
      './packages/*/src/**/__karma__/**/*.spec.js': ['webpack', 'sourcemap']
    },
    reporters: ['mocha'],
    webpack: {
      ...webpackConfig,
      devtool: 'inline-source-map'
    },
    webpackServer: {
      noInfo: true
    },
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--disable-gpu',
          '--headless',
          '--no-sandbox',
          '--remote-debugging-port=9222'
        ]
      }
    }
  });
};

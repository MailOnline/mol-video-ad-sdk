/* eslint-disable import/unambiguous, import/no-commonjs */
const baseConfig = require('../../jest.config.base');

module.exports = Object.assign(baseConfig, {
  testEnvironment: './GlobalJsDomEnv.js'
});

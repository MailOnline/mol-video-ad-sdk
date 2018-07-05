/* eslint-disable import/unambiguous, import/no-commonjs */
const baseConfig = require('../../jest.config.base');

module.exports = Object.assign(baseConfig, {
  setupFiles: ['./setupTests.js'],
  setupTestFrameworkScriptFile: '../../node_modules/jest-enzyme/lib/index.js'
});

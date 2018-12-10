/* eslint-disable import/unambiguous, import/no-commonjs */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/**/*.js',
    '**/src/**/*.jsx',
    '**/src/**/*.tsx',
    '**/src/**/*.ts',
    '!**/src/**/*.d.ts',
    '!**/src/**/__tests__/**/*',
    '!**/src/**/__storybook__/**/*',
    '!**/src/**/__karma__/**/*'
  ],
  coverageDirectory: './coverage/',
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: './GlobalJsDomEnv.js',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  testRegex: '__tests__/.*\\.spec\\.(jsx?|tsx?)$',
  testURL: 'http://localhost',
  transform: {
    '.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: ['node_modules']
};

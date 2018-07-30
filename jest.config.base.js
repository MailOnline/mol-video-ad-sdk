/* eslint-disable import/unambiguous, import/no-commonjs */
module.exports = {
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
  coverageReporters: ['json', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@mol\\/([^/]+)': '<rootDir>/../$1/src'
  },
  testRegex: '__tests__/.*\\.spec\\.(jsx?|tsx?)$',
  transform: {
    '.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: ['/node_modules/(?!@mol/).*']
};

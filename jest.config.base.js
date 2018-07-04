/* eslint-disable import/unambiguous, import/no-commonjs */
module.exports = {
  collectCoverageFrom: [
    '**/src/**/*.js',
    '**/src/**/*.jsx',
    '**/src/**/*.tsx',
    '**/src/**/*.ts',
    '!**/src/**/*.d.ts',
    '!/packages/vast-fixtures/**/*',
    '!/packages/vast-xml2js/**/*',
    '!**/src/**/__tests__/**/*',
    '!**/src/**/__storybook__/**/*',
    '!**/src/**/__karma__/**/*'
  ],
  coverageReporters: ['json'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testRegex: '__tests__/.*\\.spec\\.(jsx?|tsx?)$',
  transform: {
    '.+\\.jsx?$': 'babel-jest'

    // TODO: uncomment once we start usint TS
    // '.+\\.tsx?$': 'ts-jest'
  },
  transformIgnorePatterns: ['/node_modules/(?!@mol-fe/).*']
};
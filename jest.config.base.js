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
  coverageReporters: ['json', 'json-summary', 'html', 'text'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  testRegex: '__tests__/.*\\.spec\\.(jsx?|tsx?)$',
  testURL: 'http://localhost',
  transform: {
    '.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: ['node_modules']
};

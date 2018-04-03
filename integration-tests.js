/* eslint-disable import/unambiguous, import/no-commonjs, sort-keys, global-require, no-process-env, filenames/match-regex */

// require all modules ending in ".spec.js" from the
// current directory and all subdirectories
const testsContext = require.context('./packages/', true, /.+\/__karma__\/.+\.spec\.js$/);

testsContext.keys().forEach(testsContext);


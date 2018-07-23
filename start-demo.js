/* eslint-disable import/unambiguous, filenames/match-regex, import/no-commonjs, no-console */
const liteDevServer = require('lite-dev-server');

const server = liteDevServer({
  folder: 'demo',
  listen: 3000,
  watchFolders: ['demo']
});

console.log(`Demo server running in port ${server.address().port}`);

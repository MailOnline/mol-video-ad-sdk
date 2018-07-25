/* eslint-disable import/unambiguous, import/no-commonjs, filenames/match-regex, sort-keys */
module.exports = {
  ui: {
    port: 3001
  },
  files: [
    'static',
    'packages/react-vast-vpaid/dist',
    'packages/react-vast-vpaid/demo',
    'packages/videojs-vast-vpaid/dist',
    'packages/videojs-vast-vpaid/demo',
    'packages/video-ad-sdk/dist',
    'packages/vast-xml2js/dist'
  ],
  watchEvents: [
    'change'
  ],
  single: false,
  watchOptions: {
    ignoreInitial: true
  },
  ghostMode: {
    clicks: true,
    scroll: true,
    location: true,
    forms: {
      submit: true,
      inputs: true,
      toggles: true
    }
  },
  server: {
    baseDir: 'static',
    directory: true,
    serveStaticOptions: {
      extensions: ['html']
    },
    routes: {
      '/packages': './packages'
    }
  },
  proxy: false,
  port: 3000,
  logLevel: 'info',
  open: 'local',
  browser: ['google chrome', 'firefox'],
  cors: true,
  notify: true,
  injectChanges: true,
  startPath: null,
  minify: false,
  timestamps: true,
  clientEvents: [
    'scroll',
    'scroll:element',
    'input:text',
    'input:toggles',
    'form:submit',
    'form:reset',
    'click'
  ]
};

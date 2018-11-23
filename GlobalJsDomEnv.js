/* eslint-disable import/unambiguous, filenames/match-exported, import/no-commonjs */
// From https://github.com/facebook/jest/issues/5124

const JSDOMEnvironment = require('jest-environment-jsdom');

module.exports = class GlobalJsDomEnv extends JSDOMEnvironment {
  constructor (config) {
    super(config);
    this.global.jsdom = this.dom;

    const noop = () => {
      /* do nothing */
    };

    // Silence jsDom `Not implemented errors`
    this.global.HTMLMediaElement.prototype.load = noop;
    this.global.HTMLMediaElement.prototype.play = noop;
    this.global.HTMLMediaElement.prototype.pause = noop;
    this.global.HTMLMediaElement.prototype.addTextTrack = noop;
    this.global.open = noop;
  }

  teardown () {
    this.global.jsdom = null;

    return super.teardown();
  }
};

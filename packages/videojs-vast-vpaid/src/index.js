/**
 * @module @mol/videojs-vast-vpaid
 * @description [videojs](http://videojs.com/) plugin to play VAST/VPAID video ads.
 */

import vastVpaidPlugin from './vastVpaidPlugin';

const pluginName = 'vastVpaid';
const videojs = window.videojs;

if (!videojs) {
  throw new Error('Videojs must be loaded for VastVpaid plugin to register');
}

if (videojs.registerPlugin) {
  videojs.registerPlugin(pluginName, vastVpaidPlugin);

// for legacy videojs versions.
} else if (videojs.plugin) {
  videojs.plugin(pluginName, vastVpaidPlugin);
} else {
  throw new Error('VastVpaid plugin error: missing `videojs.registerPlugin` method is missing');
}

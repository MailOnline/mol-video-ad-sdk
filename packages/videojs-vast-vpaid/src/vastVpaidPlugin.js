import {runWaterfall} from '@mol/video-ad-sdk';
import getSnapshot from '../../../node_modules/@mol/videojs-vast-vpaid/src/helpers/getSnapshot';
import restoreSnapshot from '../../../node_modules/@mol/videojs-vast-vpaid/src/helpers/restoreSnapshot';

const createPlaceholder = (player) => {
  const element = document.createElement('div');

  element.classList.add('videojs-vast-vpaid-container');
  element.style.position = 'absolute';
  element.style.top = 0;
  element.style.left = 0;
  element.style.width = '100%';
  element.style.height = '100%';

  player.el().appendChild(element);

  return element;
};

/**
 * VideoJS Vast Vpaid plugin class
 *
 * @memberof module:@mol/videojs-vast-vpaid
 * @alias vastVpaidPlugin
 *
 * @param {Object} options - Options Map. The allowed properties are:
 * @param {Function} options.getAdTag - will be called to get the vast tag must return a vast tag (string) or a promise that will resolve with a vast tag.
 * @param {HTMLElement} [options.placeholder] - placeholder element that will contain the video ad. If not provider the plugin will create one.
 * @param {string} [options.adStartEvent] - name of the event to run an ad. The plugin try to run an ad if that event is triggered by the player.
 * Defaults to `adStart`
 * @param {string} [options.adStartedEvent] - name of the event the player will trigger to indicate an ad has started.
 * Defaults to `adStarted`
 * @param {string} [options.adStartedEvent.adUnit] - the video ad unit will be added to the `adStartedEvent` event object.
 * @param {string} [options.adCancelEvent] - name of the event to cancel an ad. The plugin will cancel any running ad if that event is triggered by the player
 * Defaults to `adCancel`
 * @param {string} [options.adFinishedEvent] - name of the event the player must trigger to indicate that the ad finished. Will be called if an ad completes or gets cancel or has an error.
 * Defaults to `adFinished`
 * @param {string} [options.adErrorEvent] - name of the event the player must trigger to indicate that there was an error playing the video ad.
 * Defaults to `adError`
 * @param {runWaterfall~onAdStart} [options.onAdStart] - will be called once the ad starts with the ad unit.
 * @param {runWaterfall~onRunFinish} [options.onRunFinish] - will be called whenever the ad run finishes. Can be used to know when to unmount the component
 * @param {Console} [options.logger] - Optional logger instance. Must comply to the [Console interface]{@link https://developer.mozilla.org/es/docs/Web/API/Console}.
 * Defaults to `window.console`
 * @param {number} [options.wrapperLimit] - Sets the maximum number of wrappers allowed in the {@link VastChain}.
 *  Defaults to `5`.
 * @param {boolean} [options.viewability] - if true it will pause the ad whenever is not visible for the viewer.
 * Defaults to `false`
 * @param {boolean} [options.responsive] - if true it will resize the ad unit whenever the ad container changes sizes.
 * Defaults to `false`
 * @param {number} [options.timeout] - timeout number in milliseconds. If set, the video ad will time out if it doesn't start within the specified time.
 * @param {TrackerFn} [options.tracker] - If provided it will be used to track the VAST events instead of the default {@link pixelTracker}.
 * @param {Object} [options.hooks] - Optional map with hooks to configure the behaviour of the ad.
 * @param {Function} [options.hooks.createSkipControl] - If provided it will be called to generate the skip control. Must return a clickable [HTMLElement](https://developer.mozilla.org/es/docs/Web/API/HTMLElement) that is detached from the DOM.
 *
 * @listens adStartEvent
 * @listens adCancelEvent
 * @fires adStartedEvent
 * @fires adErrorEvent
 * @fires adFinishedEvent
 */
const vastVpaidPlugin = function (options) {
  // eslint-disable-next-line babel/no-invalid-this, consistent-this
  const player = this;
  const {
    /**
     * Tells {@link vastVpaidPlugin} plugin to run an ad.
     *
     * @event module:@mol/videojs-vast-vpaid#adStartEvent
     * @type {object}
     * @property {string} type - The event type (name) is configurable and defaults to `adStart`
     */
    adStartEvent = 'adStart',

    /**
     * Fired by {@link vastVpaidPlugin} plugin once an ad has started
     *
     * @event module:@mol/videojs-vast-vpaid#adStartedEvent
     * @type {object}
     * @property {string} type - The event type (name) is configurable and defaults to `adStarted`
     * @property {VastAdUnit|VpaidAdUnit} adUnit - The video ad unit.
     */
    adStartedEvent = 'adStarted',

    /**
     * Tells {@link vastVpaidPlugin} plugin to cancel any running ad unit. If no ad is running it will do nothing.
     *
     * @event module:@mol/videojs-vast-vpaid#adCancelEvent
     * @type {object}
     * @property {string} type - The event type (name) is configurable and defaults to `adCancel`
     */
    adCancelEvent = 'adCancel',

    /**
     * Fired by {@link vastVpaidPlugin} plugin once an ad has finished. It will be fired no matter how the ad ended.
     *
     * @event module:@mol/videojs-vast-vpaid#adFinishedEvent
     * @type {object}
     * @property {string} type - The event type (name) is configurable and defaults to `adFinished`
     */
    adFinishedEvent = 'adFinished',

    /**
     * Fired by {@link vastVpaidPlugin} plugin if there is an error while running the ad.
     *
     * @event module:@mol/videojs-vast-vpaid#adErrorEvent
     * @type {object}
     * @property {string} type - The event type (name) is configurable and defaults to `adError`
     * @property {Error} error - The video ad error.
     */
    adErrorEvent = 'adError',
    getAdTag,
    logger = window.console,
    placeholder
  } = options;
  let snapshot = null;
  let adUnit = null;
  let adRunning = false;
  const placeholderElem = placeholder || createPlaceholder(player);

  const handleAdFinish = () => {
    adUnit = null;
    adRunning = false;

    if (snapshot) {
      restoreSnapshot(player, snapshot);
      snapshot = null;
    }

    player.trigger(adFinishedEvent);
  };

  const handleAdError = (error) => {
    logger.error(error.message, error);
    player.trigger({
      error,
      type: adErrorEvent
    });
  };

  player.on(adStartEvent, async () => {
    try {
      if (adRunning) {
        return;
      }

      adRunning = true;

      const adTag = await Promise.resolve(getAdTag());
      const tech = player.el().querySelector('.vjs-tech');

      snapshot = getSnapshot(player);
      adUnit = await runWaterfall(adTag, placeholderElem, {
        onError: handleAdError,
        onRunFinish: handleAdFinish,
        videoElement: tech,
        ...options
      });

      player.trigger({
        adUnit,
        type: adStartedEvent
      });
    } catch (error) {
      handleAdError(error);
      handleAdFinish();
    }
  });

  player.on(adCancelEvent, () => {
    if (adUnit) {
      adUnit.cancel();
    }
  });
};

export default vastVpaidPlugin;

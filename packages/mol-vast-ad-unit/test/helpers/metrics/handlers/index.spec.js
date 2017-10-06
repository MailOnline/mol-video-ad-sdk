/* eslint-disable import/max-dependencies */
import metricsHandlers from '../../../../src/helpers/metrics/handlers';
import onFullscreenChange from '../../../../src/helpers/metrics/handlers/onFullscreenChange';
import onPlayPause from '../../../../src/helpers/metrics/handlers/onPlayPause';
import onRewind from '../../../../src/helpers/metrics/handlers/onRewind';
import onSkip from '../../../../src/helpers/metrics/handlers/onSkip';
import onError from '../../../../src/helpers/metrics/handlers/onError';
import onTimeUpdate from '../../../../src/helpers/metrics/handlers/onTimeUpdate';
import onVolumeChange from '../../../../src/helpers/metrics/handlers/onVolumeChange';
import onImpression from '../../../../src/helpers/metrics/handlers/onImpression';
import onProgress from '../../../../src/helpers/metrics/handlers/onProgress';
import onClickThrough from '../../../../src/helpers/metrics/handlers/onClickThrough';

test('metricsHandlers must be an array', () => {
  expect(metricsHandlers).toBeInstanceOf(Array);
});

test('metricsHandlers must include all the metricHandlers', () => {
  expect(metricsHandlers).toEqual([
    onClickThrough,
    onError,
    onFullscreenChange,
    onImpression,
    onPlayPause,
    onProgress,
    onRewind,
    onSkip,
    onTimeUpdate,
    onVolumeChange
  ]);
});

import metrics from '../../../src/helpers/metrics';
import onFullscreenChange from '../../../src/helpers/metrics/onFullscreenChange';
import onPlayPause from '../../../src/helpers/metrics/onPlayPause';
import onRewind from '../../../src/helpers/metrics/onRewind';
import onError from '../../../src/helpers/metrics/onError';
import onTimeUpdate from '../../../src/helpers/metrics/onTimeUpdate';
import onVolumeChange from '../../../src/helpers/metrics/onVolumeChange';
import onImpression from '../../../src/helpers/metrics/onImpression';
import onProgress from '../../../src/helpers/metrics/onProgress';

test('metrics must be an array', () => {
  expect(metrics).toBeInstanceOf(Array);
});

test('metrics must include all the metricHandlers', () => {
  expect(metrics).toEqual([
    onError,
    onFullscreenChange,
    onImpression,
    onPlayPause,
    onProgress,
    onRewind,
    onTimeUpdate,
    onVolumeChange
  ]);
});

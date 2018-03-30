/* eslint-disable filenames/match-regex */
import * as videoAdSdk from '@mol/video-ad-sdk';

export const createVideoAdContainer = jest.fn(videoAdSdk.createVideoAdContainer);
export const createVideoAdUnit = jest.fn(videoAdSdk.createVideoAdUnit);
export const isAdPod = jest.fn(videoAdSdk.isAdPod);
export const load = jest.fn(videoAdSdk.load);
export const loadNext = jest.fn(videoAdSdk.loadNext);
export const VastAdUnit = videoAdSdk.VastAdUnit;
export const VideoAdContainer = videoAdSdk.VideoAdContainer;

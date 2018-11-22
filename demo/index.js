/* eslint-disable no-console, import/no-unassigned-import */
import {runWaterfall} from '../src/index';
import './demo.css';

document.addEventListener('DOMContentLoaded', () => {
  const textArea = document.querySelector('#adTag');
  const testBtn = document.querySelector('.vast-test-btn');
  const videoElement = document.querySelector('.vast-media video');
  const videoAdContainer = document.querySelector('.video-ad-container');

  const onAdReady = (adUnit) => {
    console.log('### onAdReady', adUnit);
    const evtHandler = (evt) => console.log(`### ${evt.type}`, evt.adUnit);

    [
      'pause',
      'resume',
      'finish',
      'impression',
      'start',
      'skip',
      'firstQuartile',
      'midpoint',
      'thirdQuartile',
      'complete'
    ].forEach((evtType) => {
      adUnit.on(evtType, evtHandler);
    });
  };
  const requestAdRun = () => {
    const adTag = textArea.value;
    const src = videoElement.src;
    const resumeContent = () => {
      videoElement.play();

      videoElement.removeEventListener('contentloadedmetadata', resumeContent);
      videoElement.removeEventListener('canplay', resumeContent);
    };
    const onError = (evt) => console.log('### onError', evt);
    const onRunFinish = (evt) => {
      console.log('### onRunFinish', evt);
      videoAdContainer.classList.remove('active');

      if (videoElement.src === src) {
        videoElement.play();
      } else {
        videoElement.addEventListener('contentloadedmetadata', resumeContent);
        videoElement.addEventListener('canplay', resumeContent);
        videoElement.src = src;
        videoElement.play();
      }
    };

    videoAdContainer.classList.add('active');
    videoElement.pause();
    videoElement.currentTime = 0;

    console.log('### adTag', adTag);

    runWaterfall(adTag, videoAdContainer, {
      onAdReady,
      onError,
      onRunFinish,
      timeout: 15000,
      videoElement
    });
  };

  textArea.addEventListener('change', () => {
    const adTag = textArea.value;

    if (adTag) {
      testBtn.classList.add('active');
      testBtn.addEventListener('click', requestAdRun);
    } else {
      testBtn.classList.remove('active');
      testBtn.removeEventListener('click', requestAdRun);
    }
  });
});

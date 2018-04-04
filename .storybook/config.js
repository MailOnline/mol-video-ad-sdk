import {configure} from '@storybook/react';

const req = require.context('../packages/video-ad-component/src', true, /.*(__storybook__)\/.*(\.stories|story)\.js$/);

const loadStories = () => {
  req.keys().forEach((filename) => req(filename));
};

configure(loadStories, module);
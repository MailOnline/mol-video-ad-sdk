import {configure} from '@storybook/react';

const req = require.context('../packages/react-vast/src', true, /.*(__storybook__)\/.*(\.stories|story)\.js$/);

const loadStories = () => {
  req.keys().forEach((filename) => req(filename));
};

configure(loadStories, module);
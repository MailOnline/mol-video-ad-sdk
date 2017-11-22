import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import VideoAd from '.';

storiesOf('VideoAd', module)
  .add('test', () =>
    <VideoAd onClick={action('clicked')}>Hello videoAd</VideoAd>
  );


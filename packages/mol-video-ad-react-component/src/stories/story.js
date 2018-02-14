import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import VideoAd from '../index';
import styles from './styles.css';

storiesOf('VideoAd', module)
  .add('preroll success', () =>
    <div className={styles.videoContainer}>
      <div className={styles.videoPlaceholder}>
        <VideoAd
          getTag={() => 'http://localhost:9001/vastFiles/prerollChain/start-wrapper.xml'}
          onComplete={action('complete')}
          onNonRecoverableError={action('NonRecoverableError')}
          onRecoverableError={action('RecoverableError')}
          onStart={action('start')}
          tracker={() => {}}
        >Loading ad ...</VideoAd>
      </div>
    </div>
  );


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
          getTag={() => 'http://localhost:9001/vastFiles/prerollChain/'}
          onComplete={action('complete')}
          onLinearEvent={action('linearEvent')}
          onNonRecoverableError={action('NonRecoverableError')}
          onRecoverableError={action('RecoverableError')}
          timeout={10}
        >Hello videoAd</VideoAd>
      </div>
    </div>
  );


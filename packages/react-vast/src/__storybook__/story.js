import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
/* eslint-enable import/no-extraneous-dependencies */
import {ResponsiveVideoAd, VideoAd, VideoAdIMA} from '../index';
import {VideoAd as VideoAdIMASDK} from '../ima';
import Spinner from '../Spinner';
import styles from './styles.css';

storiesOf('<ResponsiveVideoAd>', module)
  .add('Preroll success', () =>
    <div className={styles.videoContainer}>
      <div className={styles.videoPlaceholder}>
        <ResponsiveVideoAd
          getTag={() => 'http://localhost:9001/vastFiles/prerollChain/start-wrapper.xml'}
          onComplete={action('complete')}
          onLinearEvent={(eventname, ...args) => action(eventname)(...args)}
          onNonRecoverableError={action('NonRecoverableError')}
          onRecoverableError={action('RecoverableError')}
          onStart={action('start')}
          tracker={() => {}}
        >
          <Spinner />
        </ResponsiveVideoAd>
      </div>
    </div>
  );

storiesOf('<VideoAd>', module)
  .add('Preroll success', () =>
    <div className={styles.videoContainer}>
      <div className={styles.videoPlaceholder}>
        <VideoAd
          getTag={() => 'http://localhost:9001/vastFiles/prerollChain/start-wrapper.xml'}
          onComplete={action('complete')}
          onLinearEvent={(eventname, ...args) => action(eventname)(...args)}
          onNonRecoverableError={action('NonRecoverableError')}
          onRecoverableError={action('RecoverableError')}
          tracker={() => {}}
        >
          <Spinner />
        </VideoAd>
      </div>
    </div>
  );

storiesOf('<VideoAdIMA>', module)
  .add('Preroll success', () =>
    <div className={styles.videoContainer}>
      <div className={styles.videoPlaceholder}>
        <VideoAdIMA
          getTag={() => 'http://localhost:9001/vastFiles/prerollChain/start-wrapper.xml'}
          onComplete={action('complete')}
          onLinearEvent={(eventname, ...args) => action(eventname)(...args)}
          onNonRecoverableError={action('NonRecoverableError')}
          onRecoverableError={action('RecoverableError')}
          tracker={() => {}}
        >
          <Spinner />
        </VideoAdIMA>
      </div>
    </div>
  );

storiesOf('ima/<VideoAd>', module)
  .add('Preroll success', () =>
    <div className={styles.videoContainer}>
      <div className={styles.videoPlaceholder}>
        <VideoAdIMASDK
          getTag={() => 'http://localhost:9001/vastFiles/prerollChain/start-wrapper.xml'}
          onComplete={action('complete')}
          onLinearEvent={(eventname, ...args) => action(eventname)(...args)}
          onNonRecoverableError={action('NonRecoverableError')}
          onRecoverableError={action('RecoverableError')}
          tracker={() => {}}
        >
          <Spinner />
        </VideoAdIMASDK>
      </div>
    </div>
  );

storiesOf('<Spinner>', module)
  .add('Default', () =>
    <Spinner />
  );

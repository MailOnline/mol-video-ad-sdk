import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
/* eslint-enable import/no-extraneous-dependencies */
import {ResponsiveVideoAd} from '../index';
import Spinner from '../Spinner';
import styles from './styles.css';

storiesOf('VideoAd', module)
  .add('preroll success', () =>
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


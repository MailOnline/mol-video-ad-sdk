import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
/* eslint-enable import/no-extraneous-dependencies */
import {ResponsiveVideoAd} from '../index';
import styles from './styles.css';

storiesOf('VideoAd', module)
  .add('preroll success', () => {
    const skipBtn = document.createElement('button');

    skipBtn.classList.add(styles.skipControl);
    skipBtn.innerHTML = 'Skip';

    return <div className={styles.container}>
      <div className={styles.videoContainer}>
        <ResponsiveVideoAd
          getTag={() => 'http://localhost:9001/vastFiles/prerollChain/start-wrapper.xml'}
          onComplete={action('complete')}
          onLinearEvent={(eventname, ...args) => action(eventname)(...args)}
          onNonRecoverableError={action('NonRecoverableError')}
          onRecoverableError={action('RecoverableError')}
          onStart={action('start')}
          skipControl={skipBtn}
          tracker={() => { }}
        >
          <div className={styles.loading} />
        </ResponsiveVideoAd>
      </div>
    </div>;
  }
  );


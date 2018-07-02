/* eslint-disable no-console */
import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import {storiesOf} from '@storybook/react';
/* eslint-enable import/no-extraneous-dependencies */
import styles from './styles.css';
import Player from './Player';

storiesOf('VideoAd', module)
  .add('preroll success', () => <div>
    <div className={styles.container}>
      <Player
        adTag='http://localhost:9001/vastFiles/prerollChain/start-wrapper.xml'
        autoplay={false}
        poster='http://localhost:9001/assets/big_buck_bunny-poster.svg'
        source='http://localhost:9001/assets/big_buck_bunny.mp4'
      />
    </div>
    <div className={styles.credit}>
      Play icon by <a className='external text' href='https://www.iconfinder.com/vectto' rel='nofollow'>vectto</a>
       is licensed under <a className='external text' href='https://creativecommons.org/licenses/by/3.0/' rel='nofollow'>CC BY 3.0</a>
    </div>
  </div>
  );


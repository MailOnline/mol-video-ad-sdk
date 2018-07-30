const videojs = window.videojs;

/**
 * Sometimes firefox does not trigger the 'canplay' evt.
 * This code ensure that it always gets triggered.
 */
const ensureCanplayGetsFired = (player) => {
  const timeoutId = setTimeout(() => {
    player.trigger('canplay');
  }, 1000);

  player.one('canplay', () => {
    clearTimeout(timeoutId);
  });
};

const restoreTracks = (snapshot) => {
  const suppressedTracks = snapshot.suppressedTracks;

  suppressedTracks.forEach((trackSnapshot) => {
    trackSnapshot.track.mode = trackSnapshot.mode;
  });
};

const isReadyToResume = (player) => {
  if (player.readyState() > 1) {
    // some browsers and media aren't "seekable".
    // readyState greater than 1 allows for seeking without exceptions
    return true;
  }

  if (player.seekable() === undefined) {
    // if the player doesn't expose the seekable time ranges, try to
    // resume playback immediately
    return true;
  }

  if (player.seekable().length > 0) {
    // if some period of the video is seekable, resume playback
    return true;
  }

  return false;
};

// TODO: TEST THIS LOGIC
/**
 * Determine if the video element has loaded enough of the snapshot source
 * to be ready to apply the rest of the state
 */
const tryToResume = (player, snapshot, attempts) => {
  let pendingAttempts = attempts;

  // if some period of the video is seekable, resume playback
  // otherwise delay a bit and then check again unless we're out of attempts
  if (isReadyToResume(player) && pendingAttempts--) {
    try {
      if (player.currentTime() === snapshot.currentTime) {
        // if needed and no seek has been performed, restore playing status immediately
        player.play();
      } else {
        player.one('seeked', () => {
          player.play();
        });

        player.currentTime(snapshot.currentTime);
      }
    } catch (error) {
      videojs.log.warn('Failed to resume the content after an advertisement', error);
    }
  } else {
    setTimeout(() => tryToResume(player, snapshot, pendingAttempts), 50);
  }
};

const restoreSnapshot = (player, snapshot, attempts = 20) => {
  const tech = player.el().querySelector('.vjs-tech');

  if (snapshot.nativePoster) {
    tech.poster = snapshot.nativePoster;
  }

  if ('style' in snapshot) {
    tech.setAttribute('style', snapshot.style || '');
  }

  if (tech.src === snapshot.src) {
    restoreTracks(snapshot);
    player.play();
  } else {
    // on ios7, fiddling with textTracks too early will cause safari to crash
    player.one('contentloadedmetadata', () => restoreTracks(snapshot));
    player.one('canplay', () => tryToResume(player, snapshot, attempts));
    ensureCanplayGetsFired(player);

    // if the src changed for ad playback, reset it
    player.src({
      src: snapshot.src,
      type: snapshot.type
    });

    // safari requires a call to `load` to pick up a changed source
    player.load();
  }
};

export default restoreSnapshot;


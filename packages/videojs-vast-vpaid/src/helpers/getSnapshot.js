const suppressTracks = (player) => {
  let tracks = player.remoteTextTracks ? player.remoteTextTracks() : [];

  if (tracks && Array.isArray(tracks.tracks_)) {
    tracks = tracks.tracks_;
  }

  if (!Array.isArray(tracks)) {
    tracks = [];
  }

  const suppressedTracks = [];

  tracks.forEach((track) => {
    suppressedTracks.push({
      mode: track.mode,
      track
    });
    track.mode = 'disabled';
  });

  return suppressedTracks;
};

const getSnapshot = (player) => {
  const tech = player.el().querySelector('.vjs-tech');

  const snapshot = {
    currentTime: player.currentTime(),
    ended: player.ended(),
    src: player.currentSrc(),
    suppressedTracks: suppressTracks(player),
    type: player.currentType()
  };

  if (tech) {
    snapshot.nativePoster = tech.poster;
    snapshot.style = tech.getAttribute('style');
  }

  return snapshot;
};

export default getSnapshot;

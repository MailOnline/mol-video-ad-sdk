import restoreSnapshot from '../restoreSnapshot';

describe('restoreSnapshot', () => {
  let player;
  let tech;

  beforeEach(() => {
    const el = document.createElement('div');

    tech = document.createElement('video');
    tech.classList.add('vjs-tech');

    el.appendChild(tech);

    player = {};

    player.el = () => el;
    player.play = jest.fn();
    player.src = jest.fn();
    player.load = jest.fn();
    player.readyState = jest.fn();
    player.seekable = jest.fn();
    player.trigger = jest.fn();
    player.one = jest.fn();
  });

  test('must restore the poster and the style', () => {
    const snapshot = {
      currentTime: '5',
      ended: false,
      nativePoster: '//test.example.com/poster',
      src: '//test.example.com/src',
      style: 'width: 100%;',
      suppressedTracks: [],
      type: 'video/mp4'
    };

    restoreSnapshot(player, snapshot);

    expect(tech.poster).toBe(snapshot.nativePoster);
    expect(tech.getAttribute('style')).toBe(snapshot.style);
  });

  describe('with the same source,', () => {
    test('must restore the tracks and play the content', () => {
      const track = {
        mode: 'disabled',
        value: 'testTrack'
      };
      const snapshot = {
        currentTime: '5',
        ended: false,
        nativePoster: '//test.example.com/poster',
        src: '//test.example.com/src',
        style: 'width: 100%;',
        suppressedTracks: [{
          mode: 'test',
          track
        }],
        type: 'video/mp4'
      };

      tech.src = snapshot.src;

      restoreSnapshot(player, snapshot);

      expect(track.mode).toBe('test');
    });
  });

  describe('with different source', () => {
    jest.useFakeTimers();

    test('must change and load the snapshot src', () => {
      const track = {
        mode: 'disabled',
        value: 'testTrack'
      };
      const snapshot = {
        currentTime: '5',
        ended: false,
        nativePoster: '//test.example.com/poster',
        src: '//test.example.com/src',
        style: 'width: 100%;',
        suppressedTracks: [{
          mode: 'test',
          track
        }],
        type: 'video/mp4'
      };

      restoreSnapshot(player, snapshot);

      expect(player.src).toHaveBeenCalledWith({
        src: snapshot.src,
        type: snapshot.type
      });
    });

    test('must ensure `canplay` event gets fired', () => {
      const snapshot = {
        currentTime: '5',
        ended: false,
        nativePoster: '//test.example.com/poster',
        src: '//test.example.com/src',
        style: 'width: 100%;',
        suppressedTracks: [],
        type: 'video/mp4'
      };

      restoreSnapshot(player, snapshot);

      jest.runOnlyPendingTimers();

      expect(player.trigger).toBeCalledWith('canplay');
    });
  });
});

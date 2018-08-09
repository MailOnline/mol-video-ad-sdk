import getSnapshot from '../getSnapshot';

describe('getSnapshot', () => {
  let mockPlayer;
  let mockTech;

  beforeEach(() => {
    const el = document.createElement('div');

    mockPlayer = {
      currentSrc: jest.fn(),
      currentTime: jest.fn(),
      currentType: jest.fn(),
      el: () => el,
      ended: jest.fn()
    };

    mockTech = document.createElement('video');
    mockTech.classList.add('vjs-tech');
    mockTech.style.width = '100%';
    mockTech.poster = 'http://test.example.com/poster';

    el.appendChild(mockTech);

    mockPlayer.currentSrc.mockReturnValue('http://test.example.com/src');
    mockPlayer.currentTime.mockReturnValue('5');
    mockPlayer.currentType.mockReturnValue('video/mp4');
    mockPlayer.ended.mockReturnValue(false);
  });
  test('must return a snapshot of the player state', () => {
    expect(getSnapshot(mockPlayer)).toEqual({
      currentTime: '5',
      ended: false,
      nativePoster: 'http://test.example.com/poster',
      src: 'http://test.example.com/src',
      style: 'width: 100%;',
      suppressedTracks: [],
      type: 'video/mp4'
    });
  });

  test('must not add the poster and styles if there is no tech', () => {
    mockTech.parentNode.removeChild(mockTech);
    expect(getSnapshot(mockPlayer)).toEqual({
      currentTime: '5',
      ended: false,
      src: 'http://test.example.com/src',
      suppressedTracks: [],
      type: 'video/mp4'
    });
  });

  test('must suppress the remote text tracks if present', () => {
    const mockTrack = {
      mode: 'test',
      value: 'testTrack'
    };

    mockPlayer.remoteTextTracks = jest.fn();
    mockPlayer.remoteTextTracks.mockReturnValue([mockTrack]);

    expect(getSnapshot(mockPlayer)).toEqual({
      currentTime: '5',
      ended: false,
      nativePoster: 'http://test.example.com/poster',
      src: 'http://test.example.com/src',
      style: 'width: 100%;',
      suppressedTracks: [{
        mode: 'test',
        track: mockTrack
      }],
      type: 'video/mp4'
    });

    expect(mockTrack).toEqual({
      mode: 'disabled',
      value: 'testTrack'
    });
  });

  test('must ignore badly build tracks lists', () => {
    mockPlayer.remoteTextTracks = jest.fn();
    mockPlayer.remoteTextTracks.mockReturnValue('wrong');
    expect(getSnapshot(mockPlayer)).toEqual({
      currentTime: '5',
      ended: false,
      nativePoster: 'http://test.example.com/poster',
      src: 'http://test.example.com/src',
      style: 'width: 100%;',
      suppressedTracks: [],
      type: 'video/mp4'
    });
  });
});

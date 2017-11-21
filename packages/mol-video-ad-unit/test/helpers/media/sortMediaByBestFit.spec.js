import sortMediaByBestFit from '../../../src/helpers/media/sortMediaByBestFit';

test('sortMediaByBestFit must sort the mediaFiles by best screen fit', () => {
  const mediafiles = [
    {width: 120},
    {width: 100},
    {width: 90},
    {width: 95},
    {width: 150}
  ];

  const sortedMediaFiles = sortMediaByBestFit(mediafiles, {width: 100});

  expect(sortedMediaFiles).not.toBe(mediafiles);
  expect(sortedMediaFiles).toEqual([
    {width: 100},
    {width: 95},
    {width: 90},
    {width: 120},
    {width: 150}
  ]);
});

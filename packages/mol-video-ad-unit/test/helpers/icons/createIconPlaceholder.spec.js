import createPlaceholder from '../../../src/helpers/icons/createIconPlaceholder';

test('createIconPlaceholder must create the icons placeholder', () => {
  const placeholder = createPlaceholder(document);

  expect(placeholder).toBeInstanceOf(HTMLDivElement);
  expect(placeholder.classList.contains('mol-video-ad-icon-placeholder')).toBe(true);
  expect(placeholder.style.position).toBe('absolute');
  expect(placeholder.style.top).toBe('0px');
  expect(placeholder.style.left).toBe('0px');
  expect(placeholder.style.width).toBe('100%');
  expect(placeholder.style.height).toBe('100%');
});

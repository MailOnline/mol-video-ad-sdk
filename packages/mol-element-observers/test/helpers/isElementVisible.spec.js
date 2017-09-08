/* eslint-disable sort-keys */
import document from '../../src/helpers/document';
import window from '../../src/helpers/window';
import isElementVisible from '../../src/helpers/isElementVisible';

jest.mock('../../src/helpers/window', () => ({
  hidden: false
}));

jest.mock('../../src/helpers/document', () => ({
  documentElement: {
    clientHeight: 0,
    clientWidth: 0
  }
}));

test('must return false if the document has no width', () => {
  const element = global.document.createElement('div');

  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 0
  }));

  expect(isElementVisible(element)).toBe(false);
});

test('must return false if the document has no height', () => {
  const element = global.document.createElement('div');

  element.getBoundingClientRect = jest.fn(() => ({
    height: 0,
    width: 100
  }));

  expect(isElementVisible(element)).toBe(false);
});

test('must return false if the document is hidden', () => {
  const element = global.document.createElement('div');

  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 100
  }));

  document.hidden = true;
  expect(isElementVisible(element)).toBe(false);
});

test('must return true if the whole element is the viewport', () => {
  window.innerHeight = 1000;
  window.innerWidth = 1000;

  const element = global.document.createElement('div');

  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 100,
    top: 0,
    bottom: 100,
    left: 0,
    right: 100
  }));

  document.hidden = false;
  expect(isElementVisible(element)).toBe(true);
});

test('must return false if the whole element is above the viewport', () => {
  window.innerHeight = 1000;
  window.innerWidth = 1000;

  const element = global.document.createElement('div');

  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 100,
    top: -1000,
    bottom: 0,
    left: 0,
    right: 100
  }));

  document.hidden = false;
  expect(isElementVisible(element)).toBe(false);
});

test('must return false if the whole element is below the viewport', () => {
  window.innerHeight = 1000;
  window.innerWidth = 1000;

  const element = global.document.createElement('div');

  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 100,
    top: 1001,
    bottom: 1101,
    left: 0,
    right: 100
  }));

  document.hidden = false;
  expect(isElementVisible(element)).toBe(false);
});

test('must return false if the whole element is on the right of the viewport', () => {
  window.innerHeight = 1000;
  window.innerWidth = 1000;

  const element = global.document.createElement('div');

  element.getBoundingClientRect = jest.fn(() => ({
    width: 100,
    height: 100,
    top: 0,
    bottom: 100,
    left: 1001,
    right: 1101
  }));

  document.hidden = false;
  expect(isElementVisible(element)).toBe(false);
});

test('must return false if the whole element is on the left the viewport', () => {
  window.innerHeight = 1000;
  window.innerWidth = 1000;

  const element = global.document.createElement('div');

  element.getBoundingClientRect = jest.fn(() => ({
    top: 0,
    bottom: 100,
    height: 100,
    width: 100,
    left: -1101,
    right: -1
  }));

  document.hidden = false;
  expect(isElementVisible(element)).toBe(false);
});

test('must return true if the more the visible part of the element is more than the viewability percentage and false otherwise', () => {
  window.innerHeight = 1000;
  window.innerWidth = 1000;

  const element = global.document.createElement('div');

  document.hidden = false;

  // Horizontal below fraction viewability
  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 100,
    top: -61,
    bottom: 39,
    left: 0,
    right: 100
  }));

  expect(isElementVisible(element, 0.4)).toBe(false);

  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 100,
    top: -60,
    bottom: 40,
    left: 0,
    right: 100
  }));

  expect(isElementVisible(element, 0.4)).toBe(true);

  // Horizontal above fraction viewability
  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 100,
    top: 961,
    bottom: 1061,
    left: 0,
    right: 100
  }));

  expect(isElementVisible(element, 0.4)).toBe(false);

  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 100,
    top: 960,
    bottom: 1060,
    left: 0,
    right: 100
  }));

  expect(isElementVisible(element, 0.4)).toBe(true);

  // Vertical left fraction viewability
  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 100,
    top: 0,
    bottom: 100,
    left: -61,
    right: 39
  }));

  expect(isElementVisible(element, 0.4)).toBe(false);

  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 100,
    top: 0,
    bottom: 100,
    left: -60,
    right: 40
  }));

  document.hidden = false;
  expect(isElementVisible(element, 0.4)).toBe(true);

  // Vertical right fraction viewability
  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 100,
    top: 0,
    bottom: 100,
    left: 961,
    right: 1061
  }));

  expect(isElementVisible(element, 0.4)).toBe(false);

  element.getBoundingClientRect = jest.fn(() => ({
    height: 100,
    width: 100,
    top: 0,
    bottom: 100,
    left: 960,
    right: 1060
  }));

  document.hidden = false;
  expect(isElementVisible(element, 0.4)).toBe(true);
});

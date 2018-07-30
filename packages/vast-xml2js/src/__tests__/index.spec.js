import {
  get,
  getAll,
  getFirstChild,
  getText,
  getAttributes,
  getAttribute,
  parseXml
} from '../index';

const xml = `<?xml version="1.0" encoding="utf-8"?>
<note importance="high" logged="true">
    <title><![CDATA[Happy]]></title>
    <todo>Work</todo>
    <todo>Play</todo>
</note>`;

describe('parseXml', () => {
  test('must parse a given xml into a js object', () => {
    const data = parseXml(xml);

    expect(data).toEqual({
      elements: [{
        attributes: {
          importance: 'high',
          logged: 'true'
        },
        elements: [{
          elements: [{
            text: 'Happy',
            type: 'text'
          }],
          name: 'title',
          type: 'element'
        }, {
          elements: [{
            text: 'Work',
            type: 'text'
          }],
          name: 'todo',
          type: 'element'
        }, {
          elements: [{
            text: 'Play',
            type: 'text'
          }],
          name: 'todo',
          type: 'element'
        }],
        name: 'note',
        type: 'element'
      }],
      type: 'document'
    });
  });
});

describe('helpers', () => {
  let data;

  beforeEach(() => {
    data = parseXml(xml);
  });

  describe('get', () => {
    test('must return undefined if element not found', () => {
      expect(get(data, 'title')).toBeUndefined();
    });

    test('must return the element', () => {
      const noteElement = get(data, 'note');
      const titleElement = get(noteElement, 'title');

      expect(get(data, 'note')).toEqual({
        attributes: {
          importance: 'high',
          logged: 'true'
        },
        elements: [{
          elements: [{
            text: 'Happy',
            type: 'text'
          }],
          name: 'title',
          type: 'element'
        }, {
          elements: [{
            text: 'Work',
            type: 'text'
          }],
          name: 'todo',
          type: 'element'
        }, {
          elements: [{
            text: 'Play',
            type: 'text'
          }],
          name: 'todo',
          type: 'element'
        }],
        name: 'note',
        type: 'element'
      });
      expect(titleElement).toEqual({
        elements: [{
          text: 'Happy',
          type: 'text'
        }],
        name: 'title',
        type: 'element'
      });
      expect(getText(titleElement)).toBe('Happy');
    });
  });

  describe('getAll', () => {
    test('must get all the children of an element by default', () => {
      expect(getAll(data)).toBe(data.elements);
      expect(getAll(get(data, 'note'))).toEqual(data.elements[0].elements);
      expect(getAll({})).toEqual([]);
    });

    test('must filter by the passed childrenName', () => {
      const noteElement = get(data, 'note');
      const todoElements = getAll(noteElement, 'todo');

      expect(todoElements).toEqual([
        {
          elements: [{
            text: 'Work',
            type: 'text'
          }],
          name: 'todo',
          type: 'element'
        }, {
          elements: [{
            text: 'Play',
            type: 'text'
          }],
          name: 'todo',
          type: 'element'
        }
      ]);
    });

    test('must return empty string if no element', () => {
      expect(getAll({})).toEqual([]);
      expect(getAll(data, 'foo')).toEqual([]);
    });
  });

  describe('getFirstChild', () => {
    test('must return undefined if there are no children', () => {
      expect(get({})).toBeUndefined();
    });

    test('must return the first child of the element', () => {
      const noteElement = get(data, 'note');

      expect(getFirstChild(noteElement)).toBe(noteElement.elements[0]);
    });
  });

  describe('getText', () => {
    test('must return the text of the element or null', () => {
      const noteElement = get(data, 'note');
      const titleElement = get(noteElement, 'title');
      const todoElement = getAll(noteElement, 'todo')[0];

      expect(getText(titleElement)).toBe('Happy');
      expect(getText(todoElement)).toBe('Work');
      expect(getText(noteElement)).toBeNull();
      expect(getText()).toBeNull();
    });
  });

  describe('getAttributes', () => {
    test('must return the attributes of the element', () => {
      const noteElement = get(data, 'note');
      const titleElement = get(noteElement, 'title');
      const todoElement = getAll(noteElement, 'todo')[0];

      expect(getAttributes(noteElement)).toEqual({
        importance: 'high',
        logged: 'true'
      });

      expect(getAttributes(titleElement)).toEqual({});
      expect(getAttributes(todoElement)).toEqual({});
    });
  });

  describe('getAttribute', () => {
    test('must return the attribute or undefined if not found', () => {
      const noteElement = get(data, 'note');

      expect(getAttribute(noteElement, 'importance')).toBe('high');
      expect(getAttribute(noteElement, 'foo')).toBeUndefined();
    });
  });
});

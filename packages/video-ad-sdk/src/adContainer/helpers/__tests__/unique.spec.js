import unique from '../unique';

describe('unique', () => {
  test('must return a unique string using the passed namespace', () => {
    const nextId = unique('test');

    expect(nextId()).toBe('test_0');
    expect(nextId()).toBe('test_1');
    expect(nextId()).toBe('test_2');
    expect(nextId()).toBe('test_3');
  });
});

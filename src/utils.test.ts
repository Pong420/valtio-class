import { expect, test, vi } from 'vitest';
import { ValtioClass } from './ValtioClass';
import { deepClone, isPlainObject, subscribe } from './utils';

const delay = (n = 0) => new Promise(resolve => setTimeout(resolve, n));

test('stateanced subscribe', async () => {
  class State extends ValtioClass {
    props = [] as number[];
  }
  const [state] = new State().init();
  const backup = state.props;
  const fn = vi.fn();
  subscribe(state, 'props', fn);

  state.props.push(0);
  await delay();
  expect(fn).toBeCalledTimes(1);

  state.props.push(1);
  await delay();
  expect(fn).toBeCalledTimes(2);

  state.props = [];
  await delay();
  // expected callback wont' be called
  expect(fn).toBeCalledTimes(2);

  state.props.push(0);
  await delay();
  expect(fn).toBeCalledTimes(3);

  state.props = [];
  await delay();
  // expected callback wont' be called
  expect(fn).toBeCalledTimes(3);

  state.props.push(0);
  await delay();
  expect(fn).toBeCalledTimes(4);

  backup.push(0);
  await delay();
  expect(fn).toBeCalledTimes(4);
});

test('deep clone', () => {
  class Test {
    __test: this;
    constructor() {
      this.__test = this;
    }
  }

  const test = new Test();
  expect(isPlainObject(test)).toBeFalsy();
  expect(deepClone(test)).toEqual(test);

  const obj = {
    a: {
      b: 'c'
    }
  };
  expect(isPlainObject(obj)).toBeTruthy();

  const cloned = deepClone(obj);
  expect(cloned).toEqual(obj);

  obj.a.b = 'd';
  expect(obj.a.b).toEqual('d');
  expect(cloned).not.toEqual(obj);
});

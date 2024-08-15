import { expect, test, vi } from 'vitest';
import { ValtioClass } from './ValtioClass';
import { subscribe } from './utils';

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

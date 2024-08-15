import util from 'util';
import { proxy, snapshot, subscribe } from 'valtio';
import { expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ValtioClass, getFunctions, getValtioClassProperties } from './ValtioClass';

const delay = (n = 0) => new Promise(resolve => setTimeout(resolve, n));

class State extends ValtioClass {
  protected _value = 0;
  object = {
    a: 0
  };
  value(value?: number) {
    if (typeof value === 'undefined') return this._value;
    this._value = value;
  }
}

class State2 extends State {
  protected _value2 = 0;
  value2(value?: number) {
    if (typeof value === 'undefined') return this._value2;
    this._value2 = value;
  }
}

/**
 * @vitest-environment happy-dom
 */

test('reset initial value', async () => {
  // const initialValue = Math.random();
  const newValue = Math.random();

  const [state] = new State().init();

  const fn = vi.fn(() => void 0);
  const unsubscribe = subscribe(state, fn);

  state.value(newValue);
  state.object.a = 1;

  await delay();
  expect(fn).toBeCalledTimes(1);

  expect(state.value()).toBe(newValue);
  expect(snapshot(state).value()).toBe(newValue);

  state.reset();
  expect(state.value()).toBe(0);
  expect(snapshot(state).value()).toBe(0);
  expect(state.object.a).toBe(0);

  unsubscribe();
});

test('getProperties', () => {
  const state2 = proxy(new State2());
  const props = getValtioClassProperties(state2);
  expect(props).toEqual(expect.arrayContaining(['_value', '_value2', 'value2', 'value']));
});

test('getFunctions', () => {
  const state = proxy(new State());
  expect(util.types.isProxy(state)).toBeTruthy();

  const functions = getFunctions(state);
  expect(functions.value()).toBe(0);
  state.value(1);
  expect(functions.value()).toBe(1);
});

test('hooks', async () => {
  const [state, useState] = new State().init();
  const { result, rerender } = renderHook(() => useState());
  expect(result.current).toEqual(state);

  state.value(2);
  rerender();
  expect(result.current).toHaveProperty('_value', 2);
  expect(result.current).toEqual(state);
});

test('hooks with neset value', async () => {
  const [state, useState] = new State().init();
  const { result, rerender } = renderHook(() => useState(state.object));
  expect(result.current).toEqual(state.object);

  state.object.a = 2;
  rerender();
  expect(result.current).toHaveProperty('a', 2);
  expect(result.current).toEqual(state.object);
});

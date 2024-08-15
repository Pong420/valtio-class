import { test, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ValtioHistoryClass } from './ValtioHistoryClass';

class State extends ValtioHistoryClass {
  protected _value = 0;
  count = 0;
  object = {
    a: 0
  };
  value(value?: number) {
    if (typeof value === 'undefined') return this._value;
    this._value = value;
  }
  get getterValue() {
    return this._value;
  }
}

/**
 * @vitest-environment happy-dom
 */

test('ValtioHistoryClass', () => {
  const [state, history] = new State().withHistory();

  expect(state.reset).toBeDefined();
  expect(state.assign).toBeDefined();
  expect(state.hasPath).toBeDefined();

  expect(state.count).toBe(0);
  state.count = 1;
  expect(state.count).toBe(1);

  state.value(1);
  expect(state.value()).toBe(1);
  expect(history.value.value()).toBe(state.value());
  expect(state.getterValue).toBe(1);
  expect(history.value.getterValue).toBe(1);
  expect(history.isUndoEnabled).toBeTruthy();

  history.undo();
  expect(state.count).toBe(0);
  expect(state.value()).toBe(0);
  expect(history.value.value()).toBe(0);
  expect(history.isUndoEnabled).toBeFalsy();

  history.redo();
  expect(state.value()).toBe(1);
  expect(history.value.value()).toBe(state.value());
  expect(state.getterValue).toBe(0);
  expect(history.value.getterValue).toBe(0);
  expect(history.isUndoEnabled).toBeTruthy();
});

test('hooks', async () => {
  const [state, history, useState] = new State().withHistory();
  const { result, rerender } = renderHook(() => useState());

  state.value(2);
  rerender();
  expect(result.current).toHaveProperty('_value', 2);

  history.undo();

  rerender();
  expect(result.current).toHaveProperty('_value', 0);
  expect(result.current).toEqual(history.value);
  expect(result.current.value()).toEqual(state.value());
});

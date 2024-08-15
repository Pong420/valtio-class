import { test, expect } from 'vitest';
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
}

test('ValtioHistoryClass', () => {
  const [state, history] = new State().withHistory();

  expect(state.count).toBe(0);
  state.count = 1;
  expect(state.count).toBe(1);

  state.value(1);
  expect(state.value()).toBe(1);
  expect(history.value.value()).toBe(state.value());
  expect(history.isUndoEnabled).toBeTruthy();

  history.undo();
  expect(state.count).toBe(0);
  expect(state.value()).toBe(0);
  expect(history.value.value()).toBe(0);
  expect(history.isUndoEnabled).toBeFalsy();

  history.redo();
  expect(state.value()).toBe(1);
  expect(history.value.value()).toBe(state.value());
  expect(history.isUndoEnabled).toBeTruthy();
});

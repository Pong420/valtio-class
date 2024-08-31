import { useSnapshot, subscribe as _subscribe } from 'valtio';
import { subscribeKey } from 'valtio/utils';
import { derive as _derive } from 'derive-valtio';
import { DeriveGet, DerivedFn, DerivedFns, ObjectKey, Op, SubscribeOptions } from './types';
import { ValtioClass } from './ValtioClass';

export function isPlainObject(value: unknown): value is object {
  if (typeof value !== 'object' || value === null) return false;
  let proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export const deepClone = <T>(value: T): T => {
  if (!isPlainObject(value)) {
    return value;
  }
  const baseObject: T = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  Reflect.ownKeys(value).forEach(key => {
    baseObject[key as keyof T] = deepClone(value[key as keyof T]);
  });
  return baseObject;
};

/**
 * Wrapper of init function with valtio derive
 * Syntax suger of following
 * ```
 * const [proxy, useSnapshot] = new ValtioState().init();
 * export const state = derive(
 *   { ... },
 *   { proxy }
 * );
 * export const useValtioState = () => useSnapshot(state);
 * ```
 */
export function derive<U extends ValtioClass, D extends object>(
  [proxyObject]: ReturnType<U['init']>,
  derivedFns: DerivedFns<D, U>,
  options?: { sync?: boolean }
) {
  const entries = Object.entries(derivedFns) as [string, DerivedFn<unknown, unknown>][];
  const _derivedFns = entries.reduce(
    (r, [k, fn]) => ({ ...r, [k]: (get: DeriveGet) => fn(get, proxyObject) }),
    {} as DerivedFns<U, void>
  );
  const derived = _derive(_derivedFns, { proxy: proxyObject, ...options });
  return [derived, () => useSnapshot(derived)] as const;
}

/**
 * Advanced subscribe function, for an array or object properties
 *
 * When subscribing to an array or object
 * ```
 * subscribe(this.arr, callback)
 * ```
 * The callback won't be triggered by creating a new array. Also, the old subscription will no longer work.
 * ```
 * this.arr = []
 * ```
 * The function will subscribe to the change of the object.
 * If the object is redefined, the callback of subscribeKey will resubscribe the object again
 *
 * Note, both `subscribe` function won't trigger the callback when the property updated by creating a new array
 */
export function subscribe<U extends ValtioClass, K extends ObjectKey<U>>(
  valtioClass: U,
  key: K,
  callback: (data: U[K], op: Op[]) => void,
  options?: SubscribeOptions
) {
  const subscription: (() => void)[] = [];
  const unsubscribeAll = () => subscription.forEach(unsubscribe => unsubscribe());
  const main = () => {
    unsubscribeAll();
    subscription.push(
      _subscribe(valtioClass[key] as any, op => callback(valtioClass[key], op), options),
      subscribeKey(valtioClass, key, main)
    );
    return unsubscribeAll;
  };
  return main();
}

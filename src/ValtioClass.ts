import { proxy, ref, useSnapshot, subscribe } from 'valtio';
import { derive, subscribeKey } from 'valtio/utils';
import { DeriveGet, DerivedFn, DerivedFns, Functions } from './types';

/**
 * Utility class for valtio with advanced function
 */
export class ValtioClass {
  /**
   * class State extends ValtioClass {
   *  __initialProps = {
   *     // you may define extra initial props here
   *  }
   * }
   */
  protected __initialProps: unknown = {};

  /**
   * function return correct proxy object and hook
   */
  init() {
    const { __initialProps, ...props } = this;

    this.__initialProps = ref(Object.assign({}, __initialProps, props));

    // eslint-disable-next-line valtio/avoid-this-in-proxy
    const proxyObject = proxy(this);
    const functions = getFunctions(proxyObject);
    Object.assign(proxyObject, getFunctions(proxyObject));

    return [
      //
      proxyObject,
      <T extends this>(o?: T) => useSnapshot((o || proxyObject) as T)
    ] as const;
  }

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
  derive<U extends object>(derivedFns: DerivedFns<U, this>, options?: { sync?: boolean }) {
    const [proxyObject, useSnapshot] = this.init();
    const entries = Object.entries(derivedFns) as [string, DerivedFn<unknown, unknown>][];
    const _derivedFns = entries.reduce(
      (r, [k, fn]) => ({ ...r, [k]: (get: DeriveGet) => fn(get, proxyObject) }),
      {} as DerivedFns<U, void>
    );
    const derived = derive(_derivedFns, { proxy: proxyObject, ...options });
    return [derived, () => useSnapshot(derived)] as const;
  }

  /**
   * Advanced subscribe function, for an array or object properties
   * When subscribing to an array or object
   * ```
   * subscribe(this.arr, callback)
   * ```
   * callback won't be triggered by creating a new array. Also, the old subscription will no longer work.
   * ```
   * this.arr = []
   * ```
   * The function will subscribe to the change of the object.
   * If the object is redefined, the callback of subscribeKey will resubscribe the object again
   */
  subscribe<K extends keyof this>(
    key: K,
    callback: (data: this[K]) => void,
    options?: Parameters<typeof subscribe>[2]
  ) {
    const subscription: (() => void)[] = [];
    const unsubscribeAll = () => subscription.forEach(unsubscribe => unsubscribe());
    const main = () => {
      unsubscribeAll();
      subscription.push(
        subscribe(this[key] as object, () => callback(this[key]), options),
        subscribeKey(this, key, main)
      );
      return unsubscribeAll;
    };
    return main();
  }

  reset(data?: object) {
    Object.assign(this, this.__initialProps, data);
  }
}

/**
 * References:
 * https://github.com/pmndrs/valtio/discussions/466
 *
 * This function bind `this` in the class method. For example, we have
 * ```
 * class BasicState extends ValtioClass {
 *  prop = 'initial'
 *  _action(...args: unknown[]) {
 *    this.prop = 'changed'
 *  }
 * }
 * ```
 * Without `getFunctions`, you will adding `.call(proxyObject)`
 * ```
 * class State extends BasicState {
 *  action(...args: unknown[]) {
 *    this._action.call(state, ...args)
 *  }
 * }
 * const [state] = new State().init()
 * ```
 *
 * Also, you can use the function in `useSnapshot`, without bind. e.g.
 *
 * ```
 * // use
 * const bet = useSnapshot(betContext);
 * bet.setChip(100);
 *
 * // assign to component prop without bind
 * ```
 * <ChipSelector
 *   setCurChipValue={bet.setChip}
 * >
 * ```
 */
export function getFunctions<T extends object>(proxyObject: T) {
  const context = {};
  const names = getValtioClassProperties(proxyObject);

  for (const name of names) {
    const method = proxyObject[name as keyof T];
    if (name === 'constructor' || typeof method !== 'function') continue;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    Object.assign(context, { [name]: (...args: unknown[]) => method.apply(proxyObject, args) });
  }

  return context as Functions<T>;
}

const classProps = Object.getOwnPropertyNames(ValtioClass.prototype);

export function getValtioClassProperties<T extends object>(obj: T): string[] {
  return getAllProperties(obj).filter(prop => !/^(__|constructor)/.test(prop) && !classProps.includes(prop));
}

function getAllProperties(obj: object): string[] {
  const keys = Object.getOwnPropertyNames(obj);
  if (obj instanceof Object) {
    const proto = Object.getPrototypeOf(obj) as object | undefined;
    if (proto && !Object.prototype.isPrototypeOf.call(proto, ValtioClass)) {
      return [...keys, ...getAllProperties(proto)];
    }
  }
  return keys;
}

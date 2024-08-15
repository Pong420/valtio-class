import { proxy, ref, useSnapshot } from 'valtio';
import { Op, Functions } from './types';
import { deepClone } from './utils';

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
  protected __initialProps: object = {};

  /**
   * function return correct proxy object and hook
   */
  init() {
    const { __initialProps, ...props } = this;

    this.__initialProps = ref(deepClone(Object.assign({}, __initialProps, props)));

    // eslint-disable-next-line valtio/avoid-this-in-proxy
    const proxyObject = proxy(this);
    Object.assign(proxyObject, getFunctions(proxyObject));

    return [
      proxyObject,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      <T = this>(o?: T) => useSnapshot(o ?? proxyObject) as T
    ] as const;
  }

  hasPath(op: Op[], path: string) {
    for (const o of op) {
      const [, paths] = o;
      if (paths.includes(path)) return true;
    }
    return false;
  }

  assign(props: object) {
    return Object.assign(this, props);
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
 * const state = useSnapshot(_state);
 * state.setChip(100);
 *
 * // assign to component prop without bind
 * ```
 * <button onClick={state.action} />
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

export const basicClassProps = Object.getOwnPropertyNames(ValtioClass.prototype);

export function getValtioClassProperties<T extends object>(obj: T): string[] {
  return getAllProperties(obj).filter(prop => !/^(__|constructor)/.test(prop) && !basicClassProps.includes(prop));
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

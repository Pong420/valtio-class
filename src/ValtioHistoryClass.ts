import { proxyWithHistory } from 'valtio-history';
import { ref, useSnapshot } from 'valtio';
import { getFunctions, ValtioClass } from './ValtioClass';
import { deepClone } from './utils';

export class ValtioHistoryClass extends ValtioClass {
  withHistory() {
    const { __initialProps, ...props } = this;

    this.__initialProps = ref(deepClone(Object.assign({}, __initialProps, props)));

    const proxyObject = proxyWithHistory(this, {});
    const fns = getFunctions(proxyObject.value);
    Object.assign(proxyObject.value, fns);
    proxyObject.saveHistory();

    const state = {} as typeof proxyObject.value;

    for (const k in proxyObject.value) {
      Object.defineProperty(state, k, {
        // https://stackoverflow.com/questions/17893718/what-does-enumerable-mean
        enumerable: true,

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#configurable
        configurable: true,
        get() {
          return proxyObject.value[k];
        },
        set(_value) {
          proxyObject.value[k] = _value;
        }
      });
    }

    return [
      state,
      proxyObject,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      <T = this>(o?: T) => useSnapshot(o ?? proxyObject.value) as T
    ] as const;
  }
}

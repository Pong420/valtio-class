import { proxyWithHistory } from 'valtio-history';
import { ref, useSnapshot } from 'valtio';
import { getFunctions, getValtioClassProperties, ValtioClass } from './ValtioClass';
import { deepClone } from './utils';

export class ValtioHistoryClass extends ValtioClass {
  withHistory(): [this, ReturnType<typeof proxyWithHistory<this>>, <T = this>(o?: T) => T] {
    const { __initialProps, ...props } = this;

    this.__initialProps = ref(deepClone(Object.assign({}, __initialProps, props)));

    const proxyObject = proxyWithHistory(this);
    Object.assign(proxyObject.value, getFunctions(proxyObject.value));
    proxyObject.saveHistory();

    const state = {} as this;

    for (const k of getValtioClassProperties(proxyObject.value)) {
      const key = k as keyof typeof proxyObject.value;
      if (state[key]) continue;

      Object.defineProperty(state, k, {
        // https://stackoverflow.com/questions/17893718/what-does-enumerable-mean
        enumerable: true,

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#configurable
        configurable: true,
        get() {
          return proxyObject.value[key];
        },
        set(_value) {
          proxyObject.value[key] = _value;
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

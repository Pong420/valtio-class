export type DeriveGet = <T extends object>(proxyObject: T) => T;
export type DerivedFn<ProxyObject, Return> = (get: DeriveGet, proxyObject: ProxyObject) => Return;
export type DerivedFns<U extends object, ProxyObject> = { [K in keyof U]: DerivedFn<ProxyObject, U[K]> };

export type AnyFunction = (...args: any[]) => any;
export type Functions<Context> = {
  [Key in keyof Context]: Context[Key] extends AnyFunction ? Context[Key] : never;
};

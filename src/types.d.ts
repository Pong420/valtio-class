export type DeriveGet = <T extends object>(proxyObject: T) => T;
export type DerivedFn<ProxyObject, Return> = (get: DeriveGet, proxyObject: ProxyObject) => Return;
export type DerivedFns<U extends object, ProxyObject> = { [K in keyof U]: DerivedFn<ProxyObject, U[K]> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => any;
export type Functions<Context> = {
  [Key in keyof Context]: Context[Key] extends AnyFunction ? Context[Key] : never;
};

export type ObjectKey<T> = {
  [Key in keyof T]: T[Key] extends unknown[] | Record<PropertyKey, unknown> ? Key : never;
}[keyof T];

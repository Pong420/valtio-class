# Valtio Class

Utility class for [valtio](https://github.com/pmndrs/valtio)

## Usage

```bash
npm install valtio-class
```

```tsx
class Counter extends ValtioClas {
  count = 0;

  inc() {
    this.count += 1;
  }
}

const [counter, useCounter] = new Counter().init();

counter.count += 1;
counter.reset();

function CounterComponent() {
  const counter = useCounter();
  return <button onClick={() => counter.inc()}>{counter.count}</button>;
}
```

## Props / Method

### init() / reset()

The `init()` function will scan all the props of the instance and save them in the `__initialProps` property.
These values will be used when `reset()` is called.

Note, for any objects or arrays may not work as you expected. See below subscribe API for more details

```ts
class State extends ValtioClass {
 // define the initial value of the property directly
  prop = '';

  // if the property could be undefined, you must set the initial value to null
  data: Recrod<string, string> | null = null;

  // define properties with type definition, so you won't missed some field
  __initialProps: Props = {
    prop2: ''
  };
}

// reset all values to initial
state.reset();

// override the initial values
state.reset({ ... });
```

### derive

Wrapper of [derive](https://valtio.pmnd.rs/docs/api/utils/derive) in valtio

```ts
const [counter1] = new Counter();
const [counter2] = new Counter();

class Sum extends ValtioClass {}

export const [sum, useSum] = new Sum().derive({
  value: (get, sum) => {
    const count1 = get(counter1).count;
    const count2 = get(counter2).count;
    return count1 + count2;
  }
});
```

You may needs `underive` for HMR
```ts
if (module.hot) {
  module.hot.dispose(() => {
    underive(Sum);
  });
}
```

### subscribe

Advanced subscribe function, for an array or object properties
When subscribing to an array or object

```ts
subscribe(this.arr, callback);
```

callback won't be triggered by creating a new array. Also, the old subscription will no longer work.

```ts
this.arr = [];
```

With this function, if the object is redefined, the callback of `subscribeKey` will resubscribe the object again.

### assign

```ts
state.assign(newProps);
// same as
Object.assign(state, newProps);
```

### hasPath

function to check if the `Op` contains some path. It is designed for notification is sync

```ts
this.subscribe('arr', (values, op) => !this.hasPath(op, 'length') && callback(values), true);
```

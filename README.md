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

The `init()` function will scan all the props of the instance and save in `__initialProps` property.
The values will be used when `reset()` is called

Sometimes you may want the initial props typed. You can

```ts
class State extends ValtioClass {
  __initialProps: Data = {};
}

// reset all values to initial
state.reset();

// override the reset values
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

## subscribe

Advanced subscribe function, for an array or object properties
When subscribing to an array or object

```ts
subscribe(this.arr, callback);
```

callback won't be triggered by creating a new array. Also, the old subscription will no longer work.

```ts
this.arr = [];
```

The function will subscribe to the change of the object.

If the object is redefined, the callback of subscribeKey will resubscribe the object again

## assign

```ts
state.assign(newProps);
// same as
Object.assign(state, newProps);
```

## hasPath

```ts
this.subscribe('arr', (values, op) => !this.hasPath(op, 'length') && callback(values), true);
```

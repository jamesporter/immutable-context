# immutable-context

Experiment in state management

`npm i -s immutable-context`

Immer + Hooks + Context + TypeScript = Low boilerplate, Immutable, Editor-friendly State management?

[https://www.npmjs.com/package/immutable-context](https://www.npmjs.com/package/immutable-context)

# What/why/how?

You shouldn't use this on anything important... but here's how it should work:

```typescript
type CounterType = { count: number };

const { StateProvider, useImmutableContext } = createImmutableContext<
  CounterType
>({ count: 0 });

const Counter = () => {
  const { dispatch, state } = useImmutableContext();
  const increment = () =>
    dispatch(s => {
      s.count++;
    });
  return <button onClick={increment}>Count: {state.count}</button>;
};

const App = () => (
  <StateProvider>
    <Counter />
  </StateProvider>
);
```

Longer example/step-by-step:

### 1. Define a type for your state:

```typescript
type ExampleType = {
  count: number;
  deeply: {
    nested: {
      thing: {
        like: number;
      };
    };
  };
};
```

### 2. use `createImmutableContext` to generate a provider and hook for use in components

History included here to demonstrate immutability. Your editor should autocomplete stuff nicely.

```typescript
const history: ExampleType[] = [];
const { StateProvider, useImmutableContext } = createImmutableContext<
  ExampleType
>(
  {
    count: 0,
    deeply: {
      nested: {
        thing: {
          like: 5
        }
      }
    }
  },
  s => {
    history.push(s);
    console.log(history);
  }
);
```

### 3. Use the hook

- `dispatch` takes a function that mutates the state. Execpt it uses `immer` do doesn't really mutate the state
- `state` is the state

```typescript
const CountThing = () => {
  const { dispatch, state } = useImmutableContext();

  return (
    <div>
      <p>{state.count}</p>
      <button
        onClick={() =>
          dispatch(s => {
            s.count++;
          })
        }
      >
        Hit me
      </button>
      <p>{state.deeply.nested.thing.like}</p>
    </div>
  );
};
```

This is a bit verbose:

```typescript
onClick={() =>
  dispatch(s => {
    s.count++;
  })
}
```

For synchronous actions I could have done some kind of API like `genDispatch(fnToBeDispatched)` but I haven't figured out how to do async stuff nicely so for now just exposing a generic thing that could be called multiple times by something asynchronous.

Another example component:

```typescript
const DeepDiveUpdate = () => {
  const { dispatch } = useImmutableContext();

  return (
    <div>
      <button
        onClick={() =>
          dispatch(s => {
            s.deeply.nested.thing.like--;
            s.count++;
          })
        }
      >
        Dive!
      </button>
    </div>
  );
};
```

### 4. Put together in an app

Yeah, I totally ignored how you'll really need to provide the `useImmutableContext` to components, but you would need to pass around/inject the `Context` with `useContext` anyway.

```typescript
class App extends Component {
  render() {
    return (
      <StateProvider>
        <CountThing />
        <CountThing />
        <DeepDiveUpdate />
      </StateProvider>
    );
  }
}
```

[This example](https://github.com/jamesporter/immutable-context-example) in a create-react-app project.

### PS

In a real application (ha!) would do something more like, probably in entirely different file:

```typescript
const multiUpdate = dispatch => () =>
  dispatch(s => {
    s.deeply.nested.thing.like--;
    s.count++;
  });
```

Yes, just vanilla JS, very testable (and deletable). Then the component becomes:

```typescript
const DeepDiveUpdate = () => {
  const { dispatch } = useImmutableContext();
  const onUpdate = multiUpdate(dispatch);
  return (
    <div>
      <button onClick={onUpdate}>Dive!</button>
    </div>
  );
};
```

For async stuff:

```typescript
const asyncMultiUpdate = dispatch => async () => {
  dispatch(s => {
    s.count++;
  });
  await longRunningThing();
  dispatch(s => {
    s.deeply.nested.thing.like--;
  }
}
```

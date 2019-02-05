import React, { ReactNode, createContext, useContext, useState } from "react";
import produce from "immer";
import "./App.css";

type cICRet<T> = {
  StateProvider: ({ children }: { children: ReactNode }) => ReactNode;
  useImmutableContext: () => {
    state: T;
    dispatch: (update: (state: T) => void) => void;
  };
};

/**
 * @param defaultState the initial state
 * @param onUpdate optional hook for state changes
 */
export default function createImmutableContext<T>(
  defaultState: T,
  onUpdate?: (state: T) => void
): cICRet<T> {
  const _Context = createContext(defaultState);
  const { Provider } = _Context;

  let state: T = defaultState;
  let setValue: ((state: T) => void) | null = null;

  function dispatch(updateFn: (state: T) => void) {
    if (state) {
      state = produce(state, updateFn);
      setValue && setValue(state);
      onUpdate && onUpdate(state);
    }
  }

  function StateProvider({ children }: { children: ReactNode }) {
    const [value, setV] = useState(defaultState);
    state = value;
    setValue = setV;
    return <Provider value={value}>{children}</Provider>;
  }

  function useImmutableContext() {
    const state = useContext(_Context);

    return { state, dispatch };
  }

  return { StateProvider, useImmutableContext };
}

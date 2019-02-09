import React, { ReactNode, createContext, useContext, useState } from "react";
import produce from "immer";

export type cICRet<T> = {
  StateProvider: ({ children }: { children: ReactNode }) => JSX.Element;
  useImmutableContext: () => {
    state: T;
    apply: (update: (state: T) => void) => void;
  };
};

export type ImmutableStateOptions<T> = {
  willUpdate?: (state: T, update: Function) => void;
  onUpdate?: (state: T) => void;
  setSetState?: (onSetState: (state: T) => void) => void;
  onInitialize?: (state: T) => void;
};

/**
 * @param defaultState the initial state
 * @param onUpdate optional handler for state changes
 *
 * @returns { StateProvider, useImmutableContext } the first is a provider, the second a hook which gives you { state, apply }
 *
 * apply should be a function accepting your state type
 *
 * Defining a specific State type and passing createImmutableContext<ExampleType> is recommended
 */
export default function createImmutableContext<T>(
  defaultState: T,
  options: ImmutableStateOptions<T> = {}
): cICRet<T> {
  const _Context = createContext(defaultState);
  const { Provider } = _Context;

  let state: T = defaultState;
  let setValue: ((state: T) => void) | null = null;

  function apply(updateFn: (state: T) => void) {
    if (state) {
      options.willUpdate && options.willUpdate(state, updateFn);
      state = produce(state, updateFn);
      setValue && setValue(state);
      options.onUpdate && options.onUpdate(state);
    }
  }

  if (options.setSetState) {
    function _setState(newState: T) {
      if (setValue) {
        setValue(state);
      } else {
        console.error(
          `Trying to override state with ${newState} but StateProvider has not yet been created.`
        );
      }
    }
    options.setSetState(_setState);
  }

  function StateProvider({ children }: { children: ReactNode }) {
    const [value, setV] = useState(defaultState);
    state = value;
    if (!setValue) options.onInitialize && options.onInitialize(value);
    setValue = setV;
    return <Provider value={value}>{children}</Provider>;
  }

  function useImmutableContext() {
    const state = useContext(_Context);

    return { state, apply };
  }

  return { StateProvider, useImmutableContext };
}

export { logger, historyLogger, undoManager } from "./tools";

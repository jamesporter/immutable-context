import { ImmutableStateOptions } from "./index";

export function logger<T>(): ImmutableStateOptions<T> {
  return {
    onInitialize: (state: T) =>
      console.log("Have setup Immutable Context with initial state:", state),
    willUpdate: (state: T, update: Function) =>
      console.log(`Will apply update ${update.name} to:`, state),
    onUpdate: (state: T) => console.log("Updated state: ", state)
  };
}

export function historyLogger<T>(): ImmutableStateOptions<T> {
  let history: T[] = [];
  const updateHistory = (state: T) => {
    history.push(state);
    console.log(history);
  };
  return {
    onInitialize: updateHistory,
    onUpdate: updateHistory
  };
}

export function undoManager<T>(): {
  options: ImmutableStateOptions<T>;
  undo: () => void;
  redo: () => void;
  index: () => number;
  historySize: () => number;
} {
  let history: T[] = [];
  let index = -1;
  let setState: null | ((state: T) => void) = null;

  let appendToHistory = (state: T) => {
    index++;
    // blow away end of history if applicable i.e. don't preserve redos)
    history.splice(index);
    history.push(state);
    // TODO remove:
    console.log(history);
  };

  return {
    options: {
      onInitialize: appendToHistory,
      setSetState: setter => (setState = setter),
      onUpdate: appendToHistory
    },
    undo: () => {
      if (index > 0) {
        index--;
        setState && setState(history[index]);
      }
    },
    redo: () => {
      if (index < history.length - 1) {
        index++;
        setState && setState(history[index]);
      }
    },
    historySize: () => history.length,
    index: () => index
  };
}

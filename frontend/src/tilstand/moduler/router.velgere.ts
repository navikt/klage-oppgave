import { RootState } from "../root";

// The function below is called a selector and allows us to select a value
// from the state. These are kept in a separate file from the rest of the
// Redux module to avoid circular dependencies.
export function velgForrigeSti(state: RootState) {
  return state.routing.prevRoute;
}

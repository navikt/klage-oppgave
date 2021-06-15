// The function below is called a selector and allows us to select a value
// from the state. These are kept in a separate file from the rest of the
// Redux module to avoid circular dependencies.
import { RootState } from "../root";

export function velgSok(state: RootState) {
  return state.sok;
}

import { RootStateOrAny } from "react-redux";
import { OppgaveRader } from "./mine_saker";

// The function below is called a selector and allows us to select a value
// from the state. These are kept in a separate file from the rest of the
// Redux module to avoid circular dependencies.
export function velgMineSaker(state: RootStateOrAny) {
  return state.mineSaker as OppgaveRader;
}
export function velgSideLaster(state: RootStateOrAny) {
  return state.mineSaker.lasterData as boolean;
}

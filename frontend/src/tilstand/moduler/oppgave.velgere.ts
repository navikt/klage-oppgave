import { RootStateOrAny } from "react-redux";
import { OppgaveRader } from "./oppgave";

// The function below is called a selector and allows us to select a value
// from the state. These are kept in a separate file from the rest of the
// Redux module to avoid circular dependencies.
export function velgOppgaver(state: RootStateOrAny) {
  return state.oppgaver as OppgaveRader;
}
export function velgSideLaster(state: RootStateOrAny) {
  return state.oppgaver.lasterData as boolean;
}
export function velgFiltrering(state: RootStateOrAny) {
  return state.oppgaver.transformasjoner.filtrering;
}
export function velgSortering(state: RootStateOrAny) {
  return state.oppgaver.transformasjoner.sortering;
}

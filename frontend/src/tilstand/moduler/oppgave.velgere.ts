import { RootStateOrAny } from "react-redux";
import { OppgaveRader } from "./oppgave";

// The function below is called a selector and allows us to select a value
// from the state. These are kept in a separate file from the rest of the
// Redux module to avoid circular dependencies.
export function velgOppgaver(state: RootStateOrAny) {
  return state.klagebehandlinger as OppgaveRader;
}
export function velgSideLaster(state: RootStateOrAny) {
  return state.klagebehandlinger.lasterData as boolean;
}
export function velgFiltrering(state: RootStateOrAny) {
  return state.klagebehandlinger.transformasjoner.filtrering;
}
export function velgSortering(state: RootStateOrAny) {
  return state.klagebehandlinger.transformasjoner.sortering;
}
export function velgProjeksjon(state: RootStateOrAny) {
  return state.klagebehandlinger.meta.projeksjon;
}
export function velgKodeverk(state: RootStateOrAny) {
  return state.klagebehandlinger.kodeverk;
}

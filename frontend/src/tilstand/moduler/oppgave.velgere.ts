import { RootState } from "../root";

// The function below is called a selector and allows us to select a value
// from the state. These are kept in a separate file from the rest of the
// Redux module to avoid circular dependencies.
export function velgOppgaver(state: RootState) {
  return state.klagebehandlinger;
}
export function velgSideLaster(state: RootState) {
  return state.klagebehandlinger.lasterData;
}
export function velgFiltrering(state: RootState) {
  return state.klagebehandlinger.transformasjoner.filtrering;
}
export function velgSortering(state: RootState) {
  return state.klagebehandlinger.transformasjoner.sortering;
}
export function velgProjeksjon(state: RootState) {
  return state.klagebehandlinger.meta.projeksjon;
}
export function velgKodeverk(state: RootState) {
  return state.klagebehandlinger.kodeverk;
}
